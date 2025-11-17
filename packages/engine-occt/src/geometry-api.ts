import { createHandleId } from '@brepflow/types';
import type { WorkerAPI, ShapeHandle, MeshData, BoundingBox } from '@brepflow/types';
import { getOCCTWrapper, type RawShapeHandle } from './occt-wrapper';

interface TessellatePayload {
  shape: ShapeHandle | string;
  tolerance?: number;
  deflection?: number;
}

interface TessellateResult {
  mesh: MeshData;
  bbox: BoundingBox;
}

/**
 * Geometry API that talks directly to the real OCCT wasm bindings.
 * No mock fallbacks are provided – errors bubble up so callers can react.
 */
export class GeometryAPI implements WorkerAPI {
  private initialized = false;
  private readonly occtWrapper = getOCCTWrapper();
  private readonly rawShapeCache = new Map<string, RawShapeHandle>();
  private readonly handleCache = new Map<string, ShapeHandle>();
  private readonly handleRegistry = new Map<string, ShapeHandle>();
  private readonly meshCache = new Map<string, MeshData>();

  private ensurePositive(value: unknown, name: string): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      throw new Error(`${name} must be a positive number`);
    }
    return numeric;
  }

  private ensureNonNegative(value: unknown, name: string): number {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) {
      throw new Error(`${name} must be a non-negative number`);
    }
    return numeric;
  }

  private gatherShapeOperands(params: any, minimum = 2): Array<ShapeHandle | string> {
    const shapes: Array<ShapeHandle | string> = [];

    if (Array.isArray(params?.shapes)) {
      shapes.push(...params.shapes.filter(Boolean));
    }

    const candidates = [
      params?.shape1,
      params?.shape2,
      params?.shape3,
      params?.base,
      params?.tool,
      params?.shape,
    ];

    for (const candidate of candidates) {
      if (candidate && !shapes.includes(candidate)) {
        shapes.push(candidate);
      }
    }

    if (shapes.length < minimum) {
      throw new Error(`Operation requires at least ${minimum} shape${minimum === 1 ? '' : 's'}`);
    }

    return shapes;
  }

  private getMinimumDimension(handle: ShapeHandle | RawShapeHandle): number {
    const bbox = this.extractBoundingBox(handle);
    const dx = bbox.max.x - bbox.min.x;
    const dy = bbox.max.y - bbox.min.y;
    const dz = bbox.max.z - bbox.min.z;
    const dimensions = [dx, dy, dz].filter((d) => Number.isFinite(d) && d > 0);
    return dimensions.length > 0 ? Math.min(...dimensions) : Number.POSITIVE_INFINITY;
  }

  private ensureKnownShape(
    shape: ShapeHandle | string,
    operation: string
  ): { handle: ShapeHandle; id: string } {
    const candidates = new Set<string>();

    if (typeof shape === 'string') {
      candidates.add(shape);
    } else {
      if (shape.id) {
        candidates.add(String(shape.id));
      }

      const metadataRaw = (shape.metadata as Record<string, unknown> | undefined)?.rawId;
      if (typeof metadataRaw === 'string') {
        candidates.add(metadataRaw);
      }

      candidates.add(this.resolveId(shape));
    }

    for (const candidate of candidates) {
      const cachedHandle = this.handleCache.get(candidate);
      if (!cachedHandle) continue;

      const cachedRaw = (cachedHandle.metadata as Record<string, unknown> | undefined)?.rawId;
      const resolvedId = typeof cachedRaw === 'string' ? cachedRaw : this.resolveId(cachedHandle);
      return { handle: cachedHandle, id: resolvedId };
    }

    throw new Error(`${operation} received unknown shape reference`);
  }

  async init(): Promise<void> {
    if (this.initialized) return;
    await this.occtWrapper.initialize();
    this.initialized = true;
  }

  get isInitialized(): boolean {
    return this.initialized;
  }

  async invoke<T = any>(operation: string, params: any): Promise<T> {
    await this.init();

    switch (operation) {
      case 'MAKE_BOX':
        return this.makeBox(params) as unknown as T;
      case 'MAKE_BOX_WITH_ORIGIN':
        return this.makeBoxWithOrigin(params) as unknown as T;
      case 'MAKE_SPHERE':
        return this.makeSphere(params) as unknown as T;
      case 'MAKE_SPHERE_WITH_CENTER':
        return this.makeSphereWithCenter(params) as unknown as T;
      case 'MAKE_CYLINDER':
        return this.makeCylinder(params) as unknown as T;
      case 'MAKE_CONE':
        return this.makeCone(params) as unknown as T;
      case 'MAKE_TORUS':
        return this.makeTorus(params) as unknown as T;
      case 'MAKE_SHELL':
        return this.makeShell(params) as unknown as T;

      case 'BOOLEAN_UNION':
      case 'BOOLEAN_FUSE':
        return this.booleanUnion(params) as unknown as T;
      case 'BOOLEAN_DIFFERENCE':
      case 'BOOLEAN_CUT':
        return this.booleanDifference(params) as unknown as T;
      case 'BOOLEAN_INTERSECTION':
      case 'BOOLEAN_COMMON':
        return this.booleanIntersection(params) as unknown as T;

      case 'MAKE_FILLET':
        return this.makeFillet(params) as unknown as T;
      case 'MAKE_CHAMFER':
        return this.makeChamfer(params) as unknown as T;
      case 'TRANSFORM':
        return this.transform(params) as unknown as T;
      case 'COPY_SHAPE':
        return this.copyShape(params) as unknown as T;

      case 'TESSELLATE':
        return this.tessellateInternal(params) as unknown as T;
      case 'TESSELLATE_WITH_PARAMS':
        return this.tessellateWithParams(params) as unknown as T;

      case 'EXTRUDE':
      case 'MAKE_EXTRUDE':
        return this.extrude(params) as unknown as T;
      case 'REVOLVE':
      case 'MAKE_REVOLVE':
        return this.revolve(params) as unknown as T;

      case 'EXPORT_STEP':
        return this.exportSTEP(params) as unknown as T;
      case 'EXPORT_IGES':
        return this.exportIGES(params) as unknown as T;
      case 'EXPORT_OBJ':
        return this.exportOBJ(params) as unknown as T;
      case 'EXPORT_STL':
        return this.exportSTL(params) as unknown as T;

      case 'IMPORT_STEP':
        return this.importSTEP(params) as unknown as T;

      case 'GET_SHAPE_COUNT':
        return this.handleRegistry.size as unknown as T;
      case 'DELETE_SHAPE':
        return this.deleteShape(params) as unknown as T;
      case 'CLEAR_ALL_SHAPES':
        return this.clearAllShapes() as unknown as T;

      case 'HEALTH_CHECK':
        return this.healthCheck() as unknown as T;

      default:
        throw new Error(`Unsupported geometry operation: ${operation}`);
    }
  }

  // === Primitive creation ===

  private makeBox(params: any): ShapeHandle {
    const width = this.ensurePositive(params?.width ?? params?.dx ?? 100, 'width');
    const height = this.ensurePositive(params?.height ?? params?.dy ?? 100, 'height');
    const depth = this.ensurePositive(params?.depth ?? params?.dz ?? 100, 'depth');
    const raw = this.occtWrapper.makeBox(width, height, depth);
    return this.registerHandle(raw, 'solid');
  }

  private makeBoxWithOrigin(params: any): ShapeHandle {
    if (!params) {
      throw new Error('MAKE_BOX_WITH_ORIGIN requires parameters');
    }
    const width = this.ensurePositive(params.width ?? params.dx ?? 100, 'width');
    const height = this.ensurePositive(params.height ?? params.dy ?? 100, 'height');
    const depth = this.ensurePositive(params.depth ?? params.dz ?? 100, 'depth');
    const origin = params.origin ?? { x: params.x ?? 0, y: params.y ?? 0, z: params.z ?? 0 };

    const raw = this.occtWrapper.makeBoxWithOrigin(
      origin.x ?? 0,
      origin.y ?? 0,
      origin.z ?? 0,
      width,
      height,
      depth
    );
    return this.registerHandle(raw, 'solid');
  }

  private makeSphere(params: any): ShapeHandle {
    const radius = this.ensurePositive(params?.radius ?? 50, 'radius');
    const raw = this.occtWrapper.makeSphere(radius);
    return this.registerHandle(raw, 'solid');
  }

  private makeSphereWithCenter(params: any): ShapeHandle {
    if (!params) {
      throw new Error('MAKE_SPHERE_WITH_CENTER requires parameters');
    }
    const radius = this.ensurePositive(params.radius ?? 50, 'radius');
    const centerX = params.center?.x ?? params.centerX ?? 0;
    const centerY = params.center?.y ?? params.centerY ?? 0;
    const centerZ = params.center?.z ?? params.centerZ ?? 0;

    const raw = this.occtWrapper.makeSphereWithCenter(centerX, centerY, centerZ, radius);
    return this.registerHandle(raw, 'solid');
  }

  private makeCylinder(params: any): ShapeHandle {
    const radius = this.ensurePositive(params?.radius ?? 50, 'radius');
    const height = this.ensurePositive(params?.height ?? 100, 'height');
    const raw = this.occtWrapper.makeCylinder(radius, height);
    return this.registerHandle(raw, 'solid');
  }

  private makeCone(params: any): ShapeHandle {
    const radius1 = this.ensureNonNegative(params?.radius1 ?? 50, 'radius1');
    const radius2 = this.ensureNonNegative(params?.radius2 ?? 25, 'radius2');
    const height = this.ensurePositive(params?.height ?? 100, 'height');
    const raw = this.occtWrapper.makeCone(radius1, radius2, height);
    return this.registerHandle(raw, 'solid');
  }

  private makeTorus(params: any): ShapeHandle {
    const majorRadius = this.ensurePositive(params?.majorRadius ?? 50, 'majorRadius');
    const minorRadius = this.ensurePositive(params?.minorRadius ?? 20, 'minorRadius');
    const raw = this.occtWrapper.makeTorus(majorRadius, minorRadius);
    return this.registerHandle(raw, 'solid');
  }

  private makeShell(params: any): ShapeHandle {
    const { shape, thickness } = params ?? {};
    if (!shape) {
      throw new Error('MAKE_SHELL requires a shape');
    }

    const { handle } = this.ensureKnownShape(shape, 'MAKE_SHELL');
    const thicknessValue = this.ensurePositive(thickness ?? 1, 'thickness');
    const minDim = this.getMinimumDimension(handle);
    if (minDim !== Number.POSITIVE_INFINITY && thicknessValue * 2 >= minDim) {
      throw new Error('Shell thickness is too large for the target shape');
    }

    const raw = this.occtWrapper.makeShell(this.resolveId(shape), thicknessValue);
    return this.registerHandle(raw, 'shell');
  }

  // === Boolean operations ===

  private booleanUnion(params: any): ShapeHandle {
    const shapes = this.gatherShapeOperands(params, 2);
    const operandIds = shapes.map((shape) => this.ensureKnownShape(shape, 'BOOLEAN_UNION').id);

    let accumulated = this.registerHandle(
      this.occtWrapper.booleanUnion(operandIds[0], operandIds[1]),
      'boolean_union'
    );

    for (let i = 2; i < operandIds.length; i++) {
      accumulated = this.registerHandle(
        this.occtWrapper.booleanUnion(accumulated, operandIds[i]),
        'boolean_union'
      );
    }

    return accumulated;
  }

  private booleanDifference(params: any): ShapeHandle {
    const { shape1, shape2 } = params ?? {};
    if (!shape1 || !shape2) {
      throw new Error('BOOLEAN_DIFFERENCE requires a base shape and a tool shape');
    }

    const { id: baseId } = this.ensureKnownShape(shape1, 'BOOLEAN_DIFFERENCE');
    const { id: toolId } = this.ensureKnownShape(shape2, 'BOOLEAN_DIFFERENCE');

    const raw = this.occtWrapper.booleanSubtract(baseId, toolId);
    return this.registerHandle(raw, 'boolean_difference');
  }

  private booleanIntersection(params: any): ShapeHandle {
    const shapes = this.gatherShapeOperands(params, 2);
    const operandIds = shapes.map(
      (shape) => this.ensureKnownShape(shape, 'BOOLEAN_INTERSECTION').id
    );

    let accumulated = this.registerHandle(
      this.occtWrapper.booleanIntersect(operandIds[0], operandIds[1]),
      'boolean_intersection'
    );

    for (let i = 2; i < operandIds.length; i++) {
      accumulated = this.registerHandle(
        this.occtWrapper.booleanIntersect(accumulated, operandIds[i]),
        'boolean_intersection'
      );
    }

    return accumulated;
  }

  // === Feature operations ===

  private makeFillet(params: any): ShapeHandle {
    const { shape, radius = 5 } = params ?? {};
    if (!shape) {
      throw new Error('MAKE_FILLET requires a shape');
    }

    const { handle } = this.ensureKnownShape(shape, 'MAKE_FILLET');
    const radiusValue = this.ensurePositive(radius, 'radius');
    const minDimension = this.getMinimumDimension(handle);
    if (minDimension !== Number.POSITIVE_INFINITY && radiusValue * 2 >= minDimension) {
      throw new Error('Fillet radius is too large for the target shape');
    }

    const raw = this.occtWrapper.makeFillet(this.resolveId(shape), radiusValue);
    return this.registerHandle(raw, 'fillet');
  }

  private makeChamfer(params: any): ShapeHandle {
    const { shape, distance = 5 } = params ?? {};
    if (!shape) {
      throw new Error('MAKE_CHAMFER requires a shape');
    }

    const { handle } = this.ensureKnownShape(shape, 'MAKE_CHAMFER');
    const distanceValue = this.ensurePositive(distance, 'distance');
    const minDimension = this.getMinimumDimension(handle);
    if (minDimension !== Number.POSITIVE_INFINITY && distanceValue * 2 >= minDimension) {
      throw new Error('Chamfer distance is too large for the target shape');
    }

    const raw = this.occtWrapper.makeChamfer(this.resolveId(shape), distanceValue);
    return this.registerHandle(raw, 'chamfer');
  }

  // === Tessellation ===

  // WorkerAPI tessellate implementation - matches interface signature
  async tessellate(
    shapeId: string & { __brand: 'HandleId' },
    deflection: number
  ): Promise<MeshData> {
    const result = this.tessellateInternal({ shape: shapeId, tolerance: deflection });
    return result.mesh;
  }

  // WorkerAPI dispose implementation - matches interface signature
  async dispose(handleId: string & { __brand: 'HandleId' }): Promise<void> {
    return this.invoke('DELETE_SHAPE', { shape: handleId });
  }

  // Internal tessellation method with full options
  private tessellateInternal(params: TessellatePayload): TessellateResult {
    const { shape, tolerance = params?.deflection ?? 0.01 } = params ?? {};
    if (!shape) {
      throw new Error('TESSELLATE requires a shape');
    }

    const { handle, id: shapeId } = this.ensureKnownShape(shape, 'TESSELLATE');
    const toleranceValue = this.ensurePositive(tolerance, 'tolerance');
    const cacheKey = `${shapeId}:${toleranceValue}`;

    const cachedMesh = this.meshCache.get(cacheKey);
    if (cachedMesh) {
      return {
        mesh: cachedMesh,
        bbox: this.extractBoundingBox(handle),
      };
    }

    const mesh = this.occtWrapper.tessellate(shapeId, toleranceValue, params?.deflection ?? 0.5);
    this.meshCache.set(cacheKey, mesh);

    return {
      mesh,
      bbox: this.extractBoundingBox(handle),
    };
  }

  // === Sweep operations ===

  private extrude(params: any): ShapeHandle {
    const profile = params?.profile ?? params?.shape;
    if (!profile) {
      throw new Error('EXTRUDE requires a profile shape');
    }

    const { handle: profileHandle, id: profileId } = this.ensureKnownShape(profile, 'EXTRUDE');

    let dx = Number(params?.dx ?? 0);
    let dy = Number(params?.dy ?? 0);
    let dz = Number(params?.dz ?? params?.distance ?? 0);

    const direction = params?.direction;
    if (direction) {
      if (Array.isArray(direction)) {
        dx = Number(direction[0] ?? dx);
        dy = Number(direction[1] ?? dy);
        dz = Number(direction[2] ?? dz);
      } else if (typeof direction === 'object') {
        dx = Number(direction.x ?? dx);
        dy = Number(direction.y ?? dy);
        dz = Number(direction.z ?? dz);
      }
    }

    if (
      Math.abs(dx) < Number.EPSILON &&
      Math.abs(dy) < Number.EPSILON &&
      Math.abs(dz) < Number.EPSILON
    ) {
      throw new Error('EXTRUDE requires a non-zero direction vector');
    }

    const raw = this.occtWrapper.extrude(profileId, dx, dy, dz);
    return this.registerHandle(raw, profileHandle.type ?? 'solid');
  }

  private revolve(params: any): ShapeHandle {
    const profile = params?.profile ?? params?.shape;
    if (!profile) {
      throw new Error('REVOLVE requires a profile shape');
    }

    const { handle: profileHandle, id: profileId } = this.ensureKnownShape(profile, 'REVOLVE');
    const angleValue = this.ensurePositive(
      params?.angle ?? params?.radians ?? params?.degrees ?? Math.PI,
      'angle'
    );

    const axisInput = params?.axis ?? {
      x: params?.axisX ?? 0,
      y: params?.axisY ?? 0,
      z: params?.axisZ ?? 1,
    };

    const axisVector = {
      x: Number(axisInput.x ?? 0),
      y: Number(axisInput.y ?? 0),
      z: Number(axisInput.z ?? 1),
    };

    if (
      Math.abs(axisVector.x) < Number.EPSILON &&
      Math.abs(axisVector.y) < Number.EPSILON &&
      Math.abs(axisVector.z) < Number.EPSILON
    ) {
      throw new Error('REVOLVE axis cannot be the zero vector');
    }

    const originInput = params?.origin ?? {
      x: params?.originX ?? 0,
      y: params?.originY ?? 0,
      z: params?.originZ ?? 0,
    };

    const originVector = {
      x: Number(originInput.x ?? 0),
      y: Number(originInput.y ?? 0),
      z: Number(originInput.z ?? 0),
    };

    const raw = this.occtWrapper.revolve(profileId, angleValue, axisVector, originVector);
    return this.registerHandle(raw, profileHandle.type ?? 'solid');
  }

  // === Transformations ===

  private transform(params: any): ShapeHandle {
    const shapeRef = params?.shape ?? params?.source;
    if (!shapeRef) {
      throw new Error('TRANSFORM requires a shape');
    }

    const { handle, id: shapeId } = this.ensureKnownShape(shapeRef, 'TRANSFORM');

    const translation = params?.translation ?? {};
    const rotation = params?.rotation ?? {};
    const scaleParam = params?.scale;
    const scaleVector = scaleParam && typeof scaleParam === 'object' ? scaleParam : undefined;
    const uniformScale = typeof scaleParam === 'number' ? scaleParam : undefined;

    const toNumberOr = (value: unknown, fallback: number) => {
      const numeric = Number(value);
      return Number.isFinite(numeric) ? numeric : fallback;
    };

    const tx = Number(params?.tx ?? params?.translateX ?? translation.x ?? 0);
    const ty = Number(params?.ty ?? params?.translateY ?? translation.y ?? 0);
    const tz = Number(params?.tz ?? params?.translateZ ?? translation.z ?? 0);

    const rx = Number(params?.rx ?? params?.rotateX ?? rotation.x ?? 0);
    const ry = Number(params?.ry ?? params?.rotateY ?? rotation.y ?? 0);
    const rz = Number(params?.rz ?? params?.rotateZ ?? rotation.z ?? 0);

    const sx = toNumberOr(params?.sx ?? params?.scaleX ?? scaleVector?.x ?? uniformScale, 1);
    const sy = toNumberOr(params?.sy ?? params?.scaleY ?? scaleVector?.y ?? uniformScale, 1);
    const sz = toNumberOr(params?.sz ?? params?.scaleZ ?? scaleVector?.z ?? uniformScale, 1);

    const raw = this.occtWrapper.transform(shapeId, { tx, ty, tz, rx, ry, rz, sx, sy, sz });
    return this.registerHandle(raw, handle.type ?? 'solid');
  }

  private copyShape(params: any): ShapeHandle {
    const source = params?.shape ?? params?.source;
    if (!source) {
      throw new Error('COPY_SHAPE requires a source shape');
    }

    const { handle: sourceHandle, id: sourceId } = this.ensureKnownShape(source, 'COPY_SHAPE');
    const raw = this.occtWrapper.copyShape(sourceId);
    return this.registerHandle(raw, sourceHandle.type ?? 'solid');
  }

  // === Shape management ===

  private deleteShape(params: any): number {
    const target = params?.shapeId ?? params?.shape;
    if (!target) {
      throw new Error('DELETE_SHAPE requires a shape identifier');
    }

    const { handle, id: shapeId } = this.ensureKnownShape(target, 'DELETE_SHAPE');
    this.occtWrapper.deleteShape(shapeId);
    this.rawShapeCache.delete(shapeId);
    this.handleCache.delete(shapeId);
    this.handleCache.delete(handle.id);
    this.handleRegistry.delete(shapeId);

    // Purge cached meshes for this shape
    for (const key of Array.from(this.meshCache.keys())) {
      if (key.startsWith(`${shapeId}:`)) {
        this.meshCache.delete(key);
      }
    }

    return this.handleRegistry.size;
  }

  private clearAllShapes(): number {
    this.occtWrapper.clearAllShapes();
    this.rawShapeCache.clear();
    this.handleCache.clear();
    this.handleRegistry.clear();
    this.meshCache.clear();
    return 0;
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    timestamp: string;
    shapeCount: number;
    occtVersion: string;
  }> {
    return {
      healthy: this.initialized,
      timestamp: new Date().toISOString(),
      shapeCount: this.handleRegistry.size,
      occtVersion: this.occtWrapper.getVersion(),
    };
  }

  private tessellateWithParams(params: any): TessellateResult {
    const { shape, precision, angle } = params ?? {};
    if (!shape) {
      throw new Error('TESSELLATE_WITH_PARAMS requires a shape');
    }

    const { handle, id: shapeId } = this.ensureKnownShape(shape, 'TESSELLATE_WITH_PARAMS');
    const precisionValue = this.ensurePositive(precision ?? 0.01, 'precision');
    const angleValue = this.ensurePositive(angle ?? 0.5, 'angle');
    const cacheKey = `${shapeId}:${precisionValue}:${angleValue}`;

    const cachedMesh = this.meshCache.get(cacheKey);
    if (cachedMesh) {
      return {
        mesh: cachedMesh,
        bbox: this.extractBoundingBox(handle),
      };
    }

    const mesh = this.occtWrapper.tessellate(shapeId, precisionValue, angleValue);
    this.meshCache.set(cacheKey, mesh);

    return {
      mesh,
      bbox: this.extractBoundingBox(handle),
    };
  }

  // === Import/Export ===

  private exportSTEP(params: any): string {
    const { shape } = params ?? {};
    if (!shape) {
      throw new Error('EXPORT_STEP requires a shape');
    }
    return this.occtWrapper.exportSTEP(shape);
  }

  private exportIGES(params: any): string {
    const { shape } = params ?? {};
    if (!shape) {
      throw new Error('EXPORT_IGES requires a shape');
    }
    return this.occtWrapper.exportIGES(shape);
  }

  private exportOBJ(params: any): string {
    const { shape } = params ?? {};
    if (!shape) {
      throw new Error('EXPORT_OBJ requires a shape');
    }
    return this.occtWrapper.exportOBJ(shape);
  }

  private exportSTL(params: any): string {
    const { shape, binary = false } = params ?? {};
    if (!shape) {
      throw new Error('EXPORT_STL requires a shape');
    }
    return this.occtWrapper.exportSTL(shape, binary);
  }

  private importSTEP(params: any): ShapeHandle {
    const { data } = params ?? {};
    if (!data) {
      throw new Error('IMPORT_STEP requires STEP data');
    }

    const raw = this.occtWrapper.importSTEP(data);
    return this.registerHandle(raw, 'imported_step');
  }

  // === Handle management ===

  private registerHandle(raw: RawShapeHandle, fallbackType = 'solid'): ShapeHandle {
    const rawId = raw.id;
    if (!rawId || typeof rawId !== 'string') {
      throw new Error('OCCT returned a shape without an identifier');
    }

    const handle: ShapeHandle = {
      id: createHandleId(rawId),
      type: raw.type ?? fallbackType,
      hash: raw.hash,
      bbox: this.extractBoundingBox(raw),
      bbox_min_x: raw.bbox_min_x,
      bbox_min_y: raw.bbox_min_y,
      bbox_min_z: raw.bbox_min_z,
      bbox_max_x: raw.bbox_max_x,
      bbox_max_y: raw.bbox_max_y,
      bbox_max_z: raw.bbox_max_z,
      volume: raw.volume,
      area: raw.area,
      centerX: raw.centerX,
      centerY: raw.centerY,
      centerZ: raw.centerZ,
      metadata: {
        ...(raw.metadata ?? {}),
        rawId,
      },
    };

    this.rawShapeCache.set(rawId, raw);
    this.handleCache.set(rawId, handle);
    this.handleCache.set(handle.id, handle);
    this.handleRegistry.set(rawId, handle);
    return handle;
  }

  private resolveId(handle: ShapeHandle | string): string {
    if (typeof handle === 'string') {
      return handle;
    }

    const metadataRaw = handle.metadata && (handle.metadata as Record<string, unknown>).rawId;
    if (typeof metadataRaw === 'string') {
      return metadataRaw;
    }

    return String(handle.id);
  }

  private extractBoundingBox(handle: ShapeHandle | RawShapeHandle): BoundingBox {
    const minX = handle.bbox_min_x ?? handle.bbox?.min.x;
    const minY = handle.bbox_min_y ?? handle.bbox?.min.y;
    const minZ = handle.bbox_min_z ?? handle.bbox?.min.z;
    const maxX = handle.bbox_max_x ?? handle.bbox?.max.x;
    const maxY = handle.bbox_max_y ?? handle.bbox?.max.y;
    const maxZ = handle.bbox_max_z ?? handle.bbox?.max.z;

    if (
      typeof minX === 'number' &&
      typeof minY === 'number' &&
      typeof minZ === 'number' &&
      typeof maxX === 'number' &&
      typeof maxY === 'number' &&
      typeof maxZ === 'number'
    ) {
      return {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ },
      };
    }

    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    };
  }
}
