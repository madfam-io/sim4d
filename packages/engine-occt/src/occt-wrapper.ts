// NOTE: exportIGES and exportOBJ deferred as optional OCCTModule properties - pending API finalization.
/**
 * Thin wrapper over the OCCT WebAssembly bindings.
 * Ensures the WASM module is initialised once and exposes strongly typed helpers
 * for the higher-level geometry APIs.
 */

import type { MeshData, ShapeHandle } from '@sim4d/types';
import { loadOCCT, getOCCTModule as _getOCCTModule, type OCCTModule } from './occt-bindings';

export type RawShapeHandle = ShapeHandle & {
  bbox_min_x?: number;
  bbox_min_y?: number;
  bbox_min_z?: number;
  bbox_max_x?: number;
  bbox_max_y?: number;
  bbox_max_z?: number;
  volume?: number;
  area?: number;
  centerX?: number;
  centerY?: number;
  centerZ?: number;
};

export class OCCTWrapper {
  private module: OCCTModule | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const module = await loadOCCT();
    if (!module) {
      throw new Error(
        '[OCCTWrapper] CRITICAL: Real OCCT WASM module MUST be available. ONLY real geometry is supported. Check WASM files in /wasm directory.'
      );
    }

    this.module = module;
    this.initialized = true;
    logger.info('[OCCTWrapper] Real OCCT module initialised');
  }

  private ensureModule(): OCCTModule {
    if (!this.initialized || !this.module) {
      throw new Error('[OCCTWrapper] Module not initialised. Call initialize() first.');
    }
    return this.module;
  }

  private ensureHandle(handle: any, context: string): RawShapeHandle {
    if (!handle || typeof handle.id !== 'string' || handle.id.length === 0) {
      throw new Error(`[OCCTWrapper] ${context} returned an invalid shape handle`);
    }
    return handle as RawShapeHandle;
  }

  private ensureMesh(mesh: any, context: string): MeshData {
    if (!mesh || typeof mesh !== 'object') {
      throw new Error(`[OCCTWrapper] ${context} returned no mesh data`);
    }
    return {
      positions: this.toFloat32Array(mesh.positions),
      normals: this.toFloat32Array(mesh.normals),
      indices: this.toUint32Array(mesh.indices),
      edges: mesh.edges ? this.toUint32Array(mesh.edges) : undefined,
    };
  }

  private extractId(shape: ShapeHandle | string): string {
    if (typeof shape === 'string') {
      return shape;
    }
    if (shape && typeof shape.id === 'string') {
      return shape.id;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- WASM/OCCT shape handles may have non-standard ID types that need runtime coercion
    if (shape && (shape.id as unknown)) {
      return shape.id as unknown as string;
    }
    throw new Error('[OCCTWrapper] Unable to resolve shape identifier');
  }

  // === Primitive creation ===

  makeBox(width: number, height: number, depth: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeBox(width, height, depth), 'makeBox');
  }

  makeBoxWithOrigin(
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number
  ): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.makeBoxWithOrigin(x, y, z, width, height, depth),
      'makeBoxWithOrigin'
    );
  }

  makeSphere(radius: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeSphere(radius), 'makeSphere');
  }

  makeSphereWithCenter(cx: number, cy: number, cz: number, radius: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.makeSphereWithCenter(cx, cy, cz, radius),
      'makeSphereWithCenter'
    );
  }

  makeCylinder(radius: number, height: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeCylinder(radius, height), 'makeCylinder');
  }

  makeCone(radius1: number, radius2: number, height: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeCone(radius1, radius2, height), 'makeCone');
  }

  makeTorus(majorRadius: number, minorRadius: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeTorus(majorRadius, minorRadius), 'makeTorus');
  }

  // === Advanced operations ===

  extrude(profileId: string, dx: number, dy: number, dz: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.extrude(profileId, dx, dy, dz), 'extrude');
  }

  revolve(
    profileId: string,
    angle: number,
    axis: { x: number; y: number; z: number },
    origin: { x: number; y: number; z: number }
  ): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.revolve(profileId, angle, axis.x, axis.y, axis.z, origin.x, origin.y, origin.z),
      'revolve'
    );
  }

  // === Boolean operations ===

  booleanUnion(shapeA: ShapeHandle | string, shapeB: ShapeHandle | string): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.booleanUnion(this.extractId(shapeA), this.extractId(shapeB)),
      'booleanUnion'
    );
  }

  booleanSubtract(shapeA: ShapeHandle | string, shapeB: ShapeHandle | string): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.booleanSubtract(this.extractId(shapeA), this.extractId(shapeB)),
      'booleanSubtract'
    );
  }

  booleanIntersect(shapeA: ShapeHandle | string, shapeB: ShapeHandle | string): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(
      module.booleanIntersect(this.extractId(shapeA), this.extractId(shapeB)),
      'booleanIntersect'
    );
  }

  // === Feature operations ===

  makeFillet(shape: ShapeHandle | string, radius: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeFillet(this.extractId(shape), radius), 'makeFillet');
  }

  makeChamfer(shape: ShapeHandle | string, distance: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeChamfer(this.extractId(shape), distance), 'makeChamfer');
  }

  makeShell(shape: ShapeHandle | string, thickness: number): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.makeShell(this.extractId(shape), thickness), 'makeShell');
  }

  transform(
    shape: ShapeHandle | string,
    transform: {
      tx?: number;
      ty?: number;
      tz?: number;
      rx?: number;
      ry?: number;
      rz?: number;
      sx?: number;
      sy?: number;
      sz?: number;
    }
  ): RawShapeHandle {
    const module = this.ensureModule();
    const { tx = 0, ty = 0, tz = 0, rx = 0, ry = 0, rz = 0, sx = 1, sy = 1, sz = 1 } = transform;
    return this.ensureHandle(
      module.transform(this.extractId(shape), tx, ty, tz, rx, ry, rz, sx, sy, sz),
      'transform'
    );
  }

  copyShape(shape: ShapeHandle | string): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.copyShape(this.extractId(shape)), 'copyShape');
  }

  // === Tessellation ===

  tessellate(shape: ShapeHandle | string, tolerance = 0.01, angularDeflection = 0.5): MeshData {
    const module = this.ensureModule();
    const mesh = module.tessellate(this.extractId(shape), tolerance, angularDeflection);
    return this.ensureMesh(mesh, 'tessellate');
  }

  // === File I/O ===

  importSTEP(data: string): RawShapeHandle {
    const module = this.ensureModule();
    return this.ensureHandle(module.importSTEP(data), 'importSTEP');
  }

  exportSTEP(shape: ShapeHandle | string): string {
    const module = this.ensureModule();
    return module.exportSTEP(this.extractId(shape));
  }

  exportSTL(shape: ShapeHandle | string, binary = false): string {
    const module = this.ensureModule();
    return module.exportSTL(this.extractId(shape), binary);
  }

  exportIGES(shape: ShapeHandle | string): string {
    const module = this.ensureModule();
    if (!module.exportIGES) {
      throw new Error('IGES export not available in current OCCT build');
    }
    return module.exportIGES(this.extractId(shape));
  }

  exportOBJ(shape: ShapeHandle | string): string {
    const module = this.ensureModule();
    if (!module.exportOBJ) {
      throw new Error('OBJ export not available in current OCCT build');
    }
    return module.exportOBJ(this.extractId(shape));
  }

  deleteShape(shape: ShapeHandle | string): void {
    const module = this.ensureModule();
    module.deleteShape(this.extractId(shape));
  }

  clearAllShapes(): void {
    const module = this.ensureModule();
    module.clearAllShapes();
  }

  getStatus(): string {
    const module = this.ensureModule();
    return module.getStatus();
  }

  getVersion(): string {
    const module = this.ensureModule();
    return module.getOCCTVersion();
  }

  // === Helpers ===

  private toFloat32Array(data: unknown): Float32Array {
    if (data instanceof Float32Array) {
      return data;
    }
    if (Array.isArray(data)) {
      return new Float32Array(data);
    }
    if (data && typeof (data as unknown).length === 'number') {
      return Float32Array.from(data as ArrayLike<number>);
    }
    return new Float32Array();
  }

  private toUint32Array(data: unknown): Uint32Array {
    if (data instanceof Uint32Array) {
      return data;
    }
    if (Array.isArray(data)) {
      return new Uint32Array(data);
    }
    if (data && typeof (data as unknown).length === 'number') {
      return Uint32Array.from(data as ArrayLike<number>);
    }
    return new Uint32Array();
  }
}

let wrapperInstance: OCCTWrapper | null = null;

export function getOCCTWrapper(): OCCTWrapper {
  if (!wrapperInstance) {
    wrapperInstance = new OCCTWrapper();
  }
  return wrapperInstance;
}
