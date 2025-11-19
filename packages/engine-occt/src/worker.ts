import { getLogger } from './production-logger';
const logger = getLogger('OCCT');
/**
 * OCCT.wasm worker for real geometry operations
 *
 * CRITICAL: This worker uses ONLY real OCCT geometry. No mock geometry support.
 */

import { loadOCCT } from './occt-bindings';
import type { WorkerRequest, WorkerResponse } from './worker-types';

const isTestMode = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
const isBrowserLikeWorker = typeof importScripts === 'function';
const isNodeWorker = typeof process !== 'undefined' && !!process.versions?.node;

let parentPort: unknown = null;
if (!isBrowserLikeWorker) {
  try {
    const workerThreads = await import('node:worker_threads');
    parentPort = workerThreads.parentPort;
  } catch (error) {
    logger.error('[OCCT Worker] Failed to load worker_threads parent port', error);
  }
}

const postMessageToHost = (message: WorkerResponse | unknown) => {
  if (isBrowserLikeWorker) {
    (self as unknown).postMessage(message);
  } else if (parentPort) {
    parentPort.postMessage(message);
  } else {
    logger.error('[OCCT Worker] Unable to post message, no host channel available');
  }
};

const addHostMessageListener = (handler: (event: { data: WorkerRequest }) => void) => {
  if (isBrowserLikeWorker) {
    (self as unknown).addEventListener('message', handler as unknown as EventListener);
  } else if (parentPort) {
    parentPort.on('message', (data: WorkerRequest) => handler({ data }));
  } else {
    throw new Error('No messaging channel available for OCCT worker');
  }
};
let occtModule: unknown = null;
let productionAPI: unknown = null;

const loadProductionAPI = async () => {
  if (!productionAPI) {
    const module = await import('./occt-production');
    productionAPI = module.occtProductionAPI;
  }
  return productionAPI;
};
let isInitialized = false;
let useProduction = false;

const normalizeOperationType = (type: string): string => {
  const normalized = type.toUpperCase();
  if (normalized.startsWith('MAKE_')) {
    return normalized.slice(5);
  }
  switch (normalized) {
    case 'BOOLEAN_DIFFERENCE':
    case 'BOOLEAN_CUT':
      return 'BOOLEAN_SUBTRACT';
    case 'BOOLEAN_INTERSECTION':
      return 'BOOLEAN_INTERSECT';
    default:
      return normalized;
  }
};

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
};

const toVector3 = (
  value: unknown,
  fallback: [number, number, number] = [0, 0, 0]
): [number, number, number] => {
  if (Array.isArray(value) && value.length >= 3) {
    return [toFiniteNumber(value[0]), toFiniteNumber(value[1]), toFiniteNumber(value[2])];
  }

  if (value && typeof value === 'object') {
    return [
      toFiniteNumber(value.x ?? (value as unknown)[0]),
      toFiniteNumber(value.y ?? (value as unknown)[1]),
      toFiniteNumber(value.z ?? (value as unknown)[2]),
    ];
  }

  return fallback;
};

// Utility functions for future use
// const toVec3Object = (value: unknown, fallback: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 }) => {
//   const [x, y, z] = toVector3(value ?? fallback, [fallback.x, fallback.y, fallback.z]);
//   return { x, y, z };
// };

// const unwrapShape = (shape: unknown) => (shape?.raw ? shape.raw : shape);

const buildBoundingBox = (source: unknown) => {
  if (source?.bbox?.min && source?.bbox?.max) {
    return source.bbox;
  }

  return {
    min: {
      x: toFiniteNumber(source?.bbox_min_x ?? source?.min?.x),
      y: toFiniteNumber(source?.bbox_min_y ?? source?.min?.y),
      z: toFiniteNumber(source?.bbox_min_z ?? source?.min?.z),
    },
    max: {
      x: toFiniteNumber(source?.bbox_max_x ?? source?.max?.x),
      y: toFiniteNumber(source?.bbox_max_y ?? source?.max?.y),
      z: toFiniteNumber(source?.bbox_max_z ?? source?.max?.z),
    },
  };
};

const getShapeId = (shape: unknown): string => {
  if (typeof shape === 'string') {
    return shape;
  }

  if (shape && typeof shape.id === 'string') {
    return shape.id;
  }

  throw new Error('Shape reference must include an id string');
};

const normalizeShapeHandle = (handle: unknown, fallbackType = 'SOLID') => {
  if (!handle || !handle.id) {
    throw new Error('Invalid shape handle returned by OCCT');
  }

  const shapeType = (handle.type ?? fallbackType ?? 'UNKNOWN').toString().toUpperCase();

  return {
    type: 'Shape',
    shapeType,
    id: handle.id,
    hash: handle.hash,
    bbox: buildBoundingBox(handle),
    volume: handle.volume,
    area: handle.area,
    metadata: handle.metadata ?? {},
    raw: handle,
  };
};

const buildMemoryUsage = (shapeCountProvider?: () => number) => {
  const shapeCount = shapeCountProvider ? shapeCountProvider() : 0;
  const memorySample =
    typeof performance !== 'undefined' && 'memory' in performance
      ? (performance as unknown).memory
      : null;

  const toMB = (value: number | undefined) =>
    typeof value === 'number' ? Number((value / (1024 * 1024)).toFixed(2)) : undefined;

  return {
    shapeCount,
    heapUsedMB: memorySample ? toMB(memorySample.usedJSHeapSize) : undefined,
    heapTotalMB: memorySample ? toMB(memorySample.totalJSHeapSize) : undefined,
    timestamp: Date.now(),
  };
};

const guardModuleMethod = (module: unknown, name: string) => {
  if (!module || typeof module[name] !== 'function') {
    throw new Error(`OCCT module does not expose required operation '${name}'`);
  }
};

const handleWithBindings = (request: WorkerRequest): unknown => {
  if (!occtModule) {
    throw new Error('OCCT module is not initialized');
  }

  // NOTE: Type assertion required - normalizeOperationType breaks discriminated union narrowing.
  // Operation normalization (e.g., 'MAKE_BOX' -> 'BOX') prevents TypeScript from narrowing
  // request.params to specific type. Runtime safe due to switch logic. Refactor to preserve
  // type discrimination by switching on request.type directly (pending type system improvements).
  const params = (request.params ?? {}) as unknown;
  const operation = normalizeOperationType(request.type);

  switch (operation) {
    case 'BOX': {
      const width = toFiniteNumber(params.width ?? params.dx ?? params.depth ?? 1);
      const height = toFiniteNumber(params.height ?? params.dy ?? width);
      const depth = toFiniteNumber(params.depth ?? params.dz ?? height);

      let handle;

      if (params.center) {
        const [cx, cy, cz] = toVector3(params.center);
        guardModuleMethod(occtModule, 'makeBoxWithOrigin');
        handle = occtModule.makeBoxWithOrigin(
          cx - width / 2,
          cy - height / 2,
          cz - depth / 2,
          width,
          height,
          depth
        );
      } else {
        guardModuleMethod(occtModule, 'makeBox');
        handle = occtModule.makeBox(width, height, depth);
      }

      return normalizeShapeHandle(handle);
    }

    case 'SPHERE': {
      const radius = toFiniteNumber(params.radius ?? (params.diameter ? params.diameter / 2 : 1));
      let handle;

      if (params.center) {
        const [cx, cy, cz] = toVector3(params.center);
        guardModuleMethod(occtModule, 'makeSphereWithCenter');
        handle = occtModule.makeSphereWithCenter(cx, cy, cz, radius);
      } else {
        guardModuleMethod(occtModule, 'makeSphere');
        handle = occtModule.makeSphere(radius);
      }

      return normalizeShapeHandle(handle);
    }

    case 'CYLINDER': {
      guardModuleMethod(occtModule, 'makeCylinder');
      const radius = toFiniteNumber(params.radius ?? (params.diameter ? params.diameter / 2 : 1));
      const height = toFiniteNumber(params.height ?? params.length ?? 1);
      const handle = occtModule.makeCylinder(radius, height);
      return normalizeShapeHandle(handle);
    }

    case 'CONE': {
      guardModuleMethod(occtModule, 'makeCone');
      const radius1 = toFiniteNumber(params.radius1 ?? params.bottomRadius ?? 1);
      const radius2 = toFiniteNumber(params.radius2 ?? params.topRadius ?? 0);
      const height = toFiniteNumber(params.height ?? 1);
      const handle = occtModule.makeCone(radius1, radius2, height);
      return normalizeShapeHandle(handle);
    }

    case 'TORUS': {
      guardModuleMethod(occtModule, 'makeTorus');
      const majorRadius = toFiniteNumber(params.majorRadius ?? params.outerRadius ?? 1);
      const minorRadius = toFiniteNumber(params.minorRadius ?? params.innerRadius ?? 0.25);
      const handle = occtModule.makeTorus(majorRadius, minorRadius);
      return normalizeShapeHandle(handle);
    }

    case 'EXTRUDE': {
      const profile = params.profile ?? params.profileId;
      if (!profile) {
        throw new Error('EXTRUDE requires a profile handle');
      }

      const direction = toVector3(params.direction ?? [0, 0, toFiniteNumber(params.distance ?? 1)]);
      guardModuleMethod(occtModule, 'extrude');
      const handle = occtModule.extrude(
        getShapeId(profile),
        direction[0],
        direction[1],
        direction[2]
      );
      return normalizeShapeHandle(handle);
    }

    case 'REVOLVE': {
      const profile = params.profile ?? params.profileId;
      if (!profile) {
        throw new Error('REVOLVE requires a profile handle');
      }

      const axis = toVector3(params.axis ?? [0, 0, 1]);
      const origin = toVector3(params.origin ?? [0, 0, 0]);
      const angle = toFiniteNumber(params.angle ?? params.degrees ?? 360);
      guardModuleMethod(occtModule, 'revolve');
      const handle = occtModule.revolve(
        getShapeId(profile),
        angle,
        axis[0],
        axis[1],
        axis[2],
        origin[0],
        origin[1],
        origin[2]
      );
      return normalizeShapeHandle(handle);
    }

    case 'SWEEP': {
      guardModuleMethod(occtModule, 'makeSweep');
      const profile = getShapeId(params.profile);
      const path = getShapeId(params.path);
      const handle = occtModule.makeSweep(profile, path, params.options ?? {});
      return normalizeShapeHandle(handle);
    }

    case 'LOFT': {
      guardModuleMethod(occtModule, 'makeLoft');
      const sections = Array.isArray(params.sections) ? params.sections : [];
      if (sections.length < 2) {
        throw new Error('LOFT requires at least two section handles');
      }
      const sectionIds = sections.map((section: unknown) => getShapeId(section));
      const handle = occtModule.makeLoft(sectionIds, params.options ?? {});
      return normalizeShapeHandle(handle);
    }

    case 'FILLET': {
      guardModuleMethod(occtModule, 'makeFillet');
      const shapeId = getShapeId(params.shape);
      const radius = toFiniteNumber(params.radius ?? params.size ?? 0.5);
      const handle = occtModule.makeFillet(shapeId, radius);
      return normalizeShapeHandle(handle);
    }

    case 'CHAMFER': {
      guardModuleMethod(occtModule, 'makeChamfer');
      const shapeId = getShapeId(params.shape);
      const distance = toFiniteNumber(params.distance ?? params.size ?? 0.5);
      const handle = occtModule.makeChamfer(shapeId, distance);
      return normalizeShapeHandle(handle);
    }

    case 'SHELL': {
      guardModuleMethod(occtModule, 'makeShell');
      const shapeId = getShapeId(params.shape);
      const thickness = toFiniteNumber(params.thickness ?? params.offset ?? 1);
      const handle = occtModule.makeShell(shapeId, thickness);
      return normalizeShapeHandle(handle);
    }

    case 'OFFSET': {
      guardModuleMethod(occtModule, 'makeOffset');
      const shapeId = getShapeId(params.shape);
      const offset = toFiniteNumber(params.offset ?? params.distance ?? 1);
      const handle = occtModule.makeOffset(shapeId, offset, params.options ?? {});
      return normalizeShapeHandle(handle);
    }

    case 'TRANSFORM': {
      guardModuleMethod(occtModule, 'transform');
      const shapeId = getShapeId(params.shape);
      const translation = toVector3(params.translation);
      const rotation = toVector3(params.rotation);
      const scale = toVector3(params.scale ?? [1, 1, 1], [1, 1, 1]);
      const handle = occtModule.transform(
        shapeId,
        translation[0],
        translation[1],
        translation[2],
        rotation[0],
        rotation[1],
        rotation[2],
        scale[0],
        scale[1],
        scale[2]
      );
      return normalizeShapeHandle(handle);
    }

    case 'COPY_SHAPE': {
      guardModuleMethod(occtModule, 'copyShape');
      const shapeId = getShapeId(params.shape);
      const handle = occtModule.copyShape(shapeId);
      return normalizeShapeHandle(handle);
    }

    case 'BOOLEAN_UNION': {
      guardModuleMethod(occtModule, 'booleanUnion');
      const shapeRefs = Array.isArray(params.shapes)
        ? params.shapes
        : [params.shape1, params.shape2].filter(Boolean);

      if (!shapeRefs || shapeRefs.length < 2) {
        throw new Error('BOOLEAN_UNION requires at least two shapes');
      }

      let workingHandle: unknown = null;
      let currentId = getShapeId(shapeRefs[0]);

      for (let i = 1; i < shapeRefs.length; i++) {
        const nextId = getShapeId(shapeRefs[i]);
        workingHandle = occtModule.booleanUnion(currentId, nextId);
        currentId = workingHandle.id;
      }

      return normalizeShapeHandle(workingHandle);
    }

    case 'BOOLEAN_SUBTRACT': {
      guardModuleMethod(occtModule, 'booleanSubtract');
      const base = params.base ?? params.shape ?? params.shape1;
      const tools = Array.isArray(params.tools)
        ? params.tools
        : [params.tool, params.shape2].filter(Boolean);

      if (!base || !tools.length) {
        throw new Error('BOOLEAN_SUBTRACT requires a base shape and at least one tool');
      }

      let workingHandle: unknown = null;
      let currentId = getShapeId(base);

      for (const tool of tools) {
        const toolId = getShapeId(tool);
        workingHandle = occtModule.booleanSubtract(currentId, toolId);
        currentId = workingHandle.id;
      }

      return normalizeShapeHandle(workingHandle);
    }

    case 'BOOLEAN_INTERSECT': {
      guardModuleMethod(occtModule, 'booleanIntersect');
      const shapeRefs = Array.isArray(params.shapes)
        ? params.shapes
        : [params.shape1, params.shape2].filter(Boolean);

      if (!shapeRefs || shapeRefs.length < 2) {
        throw new Error('BOOLEAN_INTERSECT requires at least two shapes');
      }

      let workingHandle: unknown = null;
      let currentId = getShapeId(shapeRefs[0]);

      for (let i = 1; i < shapeRefs.length; i++) {
        const nextId = getShapeId(shapeRefs[i]);
        workingHandle = occtModule.booleanIntersect(currentId, nextId);
        currentId = workingHandle.id;
      }

      return normalizeShapeHandle(workingHandle);
    }

    case 'TESSELLATE': {
      guardModuleMethod(occtModule, 'tessellate');
      const shapeId = getShapeId(params.shape);
      const precision = toFiniteNumber(params.precision ?? params.deflection ?? 0.1);
      const angle = toFiniteNumber(params.angle ?? 0.5);
      const mesh = occtModule.tessellate(shapeId, precision, angle);

      return {
        mesh: {
          positions:
            mesh.positions instanceof Float32Array
              ? mesh.positions
              : new Float32Array(mesh.positions ?? []),
          normals:
            mesh.normals instanceof Float32Array
              ? mesh.normals
              : new Float32Array(mesh.normals ?? []),
          indices:
            mesh.indices instanceof Uint32Array
              ? mesh.indices
              : new Uint32Array(mesh.indices ?? []),
          uvs: mesh.uvs instanceof Float32Array ? mesh.uvs : undefined,
        },
        bbox: params.shape?.bbox,
      };
    }

    case 'IMPORT_STEP': {
      guardModuleMethod(occtModule, 'importSTEP');
      const fileData = params.fileData ?? params.data;
      if (!fileData) {
        throw new Error('IMPORT_STEP requires file data');
      }
      const handle = occtModule.importSTEP(fileData);
      return normalizeShapeHandle(handle);
    }

    case 'EXPORT_STEP': {
      guardModuleMethod(occtModule, 'exportSTEP');
      const shapeId = getShapeId(params.shape);
      return occtModule.exportSTEP(shapeId);
    }

    case 'EXPORT_STL': {
      guardModuleMethod(occtModule, 'exportSTL');
      const shapeId = getShapeId(params.shape);
      const binary = params.binary !== undefined ? Boolean(params.binary) : true;
      return occtModule.exportSTL(shapeId, binary);
    }

    case 'EXPORT_IGES': {
      guardModuleMethod(occtModule, 'exportIGES');
      const shapeId = getShapeId(params.shape);
      return occtModule.exportIGES(shapeId);
    }

    case 'EXPORT_OBJ': {
      guardModuleMethod(occtModule, 'exportOBJ');
      const shapeId = getShapeId(params.shape);
      return occtModule.exportOBJ(shapeId);
    }

    case 'EXPORT_BREP': {
      guardModuleMethod(occtModule, 'exportBREP');
      const shapeId = getShapeId(params.shape);
      return occtModule.exportBREP(shapeId);
    }

    case 'DELETE_SHAPE': {
      guardModuleMethod(occtModule, 'deleteShape');
      const shapeId = getShapeId(params.shape);
      occtModule.deleteShape(shapeId);
      return { success: true };
    }

    case 'CLEAR_ALL': {
      guardModuleMethod(occtModule, 'clearAllShapes');
      occtModule.clearAllShapes();
      return { success: true };
    }

    case 'GET_STATUS': {
      guardModuleMethod(occtModule, 'getStatus');
      return {
        status: occtModule.getStatus(),
        version: occtModule.getOCCTVersion?.(),
        shapeCount: occtModule.getShapeCount?.() ?? 0,
      };
    }

    case 'HEALTH_CHECK': {
      return {
        healthy: true,
        usingRealOCCT: true,
        backend: 'occt-wasm-fallback',
        status: occtModule.getStatus?.(),
        version: occtModule.getOCCTVersion?.(),
        shapeCount: occtModule.getShapeCount?.() ?? 0,
        timestamp: Date.now(),
      };
    }

    case 'GET_MEMORY_USAGE': {
      return buildMemoryUsage(() => occtModule?.getShapeCount?.() ?? 0);
    }

    case 'GET_BOUNDING_BOX': {
      if (!params.shape) {
        throw new Error('GET_BOUNDING_BOX requires a shape with bounding data');
      }
      return buildBoundingBox(params.shape);
    }

    default:
      throw new Error(`Unknown operation: ${request.type}`);
  }
};

// Handle messages from host environment (browser worker or Node worker thread)
addHostMessageListener(async (event: { data: WorkerRequest }) => {
  // Verify message structure for security
  if (!event.data || typeof event.data !== 'object') {
    logger.warn('Invalid message format received');
    return;
  }

  const request = event.data;

  // Validate required message fields to ensure it's from a trusted source
  if (!request.type || typeof request.type !== 'string') {
    logger.warn('Message missing required type field');
    return;
  }

  // Validate request ID if present
  if (request.id !== undefined && typeof request.id !== 'string' && typeof request.id !== 'number') {
    logger.warn('Invalid request ID format');
    return;
  }

  try {
    let result: unknown;

    if (request.type === 'INIT') {
      if (!isInitialized) {
        const canUseProductionAPI = !isTestMode && isBrowserLikeWorker;

        if (canUseProductionAPI) {
          try {
            logger.info('[OCCT Worker] Attempting production API initialization...');
            const api = await loadProductionAPI();
            await api.ensureInitialized();
            useProduction = true;
            isInitialized = true;
            // productionInitialized = true; // Tracked via useProduction
            logger.info('✅ OCCT worker initialized with production API (real geometry)');
          } catch (prodError) {
            logger.warn('[OCCT Worker] Production API failed:', prodError);
          }
        }

        if (!isInitialized) {
          try {
            logger.info('[OCCT Worker] Attempting fallback bindings...');
            occtModule = await loadOCCT();
            if (occtModule) {
              isInitialized = true;
              useProduction = false;
              logger.info('✅ OCCT worker initialized with fallback bindings (real geometry)');
            }
          } catch (bindError) {
            logger.error('[OCCT Worker] Fallback bindings also failed:', bindError);
          }
        }

        if (!isInitialized) {
          const errorMsg =
            'CRITICAL: Failed to initialize real OCCT geometry. No fallback available.';
          logger.error(errorMsg);
          throw new Error(errorMsg);
        }
      }

      result = {
        initialized: isInitialized,
        production: useProduction,
        testMode: isTestMode,
        nodeWorker: isNodeWorker,
        browserWorker: isBrowserLikeWorker,
      };
    } else if (useProduction && isInitialized) {
      const api = await loadProductionAPI();
      const productionResponse = await api.execute({
        id: request.id,
        type: request.type,
        params: request.params,
      });

      if (!productionResponse.success) {
        const errorInfo = productionResponse.error;
        const message =
          typeof errorInfo === 'string'
            ? errorInfo
            : (errorInfo?.message ?? `OCCT operation ${request.type} failed`);
        throw new Error(message);
      }

      result = productionResponse.result;
    } else if (isInitialized && occtModule) {
      result = handleWithBindings(request);
    } else {
      throw new Error(`Real OCCT not initialized - cannot perform ${request.type}`);
    }

    postMessageToHost({
      id: request.id,
      success: true,
      result,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    postMessageToHost({
      id: request.id,
      success: false,
      error: {
        code: 'WORKER_ERROR',
        message: errorMessage,
        details: error,
      },
    });
  }
});

// Export for TypeScript
export {};
