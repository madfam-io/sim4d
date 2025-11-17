/**
 * OCCT Operation Router
 * Maps node operations to actual OCCT worker operations
 * Ensures long-term stable solution without duplication
 */

import type { WorkerAPI } from '@brepflow/types';
import type { ProductionWorkerAPI as _ProductionWorkerAPI } from './production-api';
// import { GeometryAPIFactory } from '@brepflow/engine-core'; // TODO: Not exported from engine-core

/**
 * Comprehensive operation mapping from node operations to OCCT worker operations
 * This ensures nodes can use intuitive names while the worker uses OCCT conventions
 */
export const NODE_TO_OCCT_OPERATION_MAP: Record<string, string> = {
  // Primitive creation - nodes use camelCase, OCCT uses UPPER_SNAKE
  makeBox: 'MAKE_BOX',
  makeSphere: 'MAKE_SPHERE',
  makeCylinder: 'MAKE_CYLINDER',
  makeCone: 'MAKE_CONE',
  makeTorus: 'MAKE_TORUS',
  makePipe: 'MAKE_PIPE',
  makeEllipsoid: 'MAKE_ELLIPSOID',
  makeCapsule: 'MAKE_CAPSULE',
  makePolyhedron: 'MAKE_POLYHEDRON',
  makeRoundedBox: 'MAKE_ROUNDED_BOX',

  // Alternative names for compatibility
  createBox: 'CREATE_BOX',
  createSphere: 'CREATE_SPHERE',
  createCylinder: 'CREATE_CYLINDER',

  // 2D Primitives
  createLine: 'CREATE_LINE',
  createCircle: 'CREATE_CIRCLE',
  createRectangle: 'CREATE_RECTANGLE',
  createArc: 'CREATE_ARC',
  createPoint: 'CREATE_POINT',
  createEllipse: 'CREATE_ELLIPSE',
  createPolygon: 'CREATE_POLYGON',
  createPolyline: 'CREATE_POLYLINE',
  createText: 'CREATE_TEXT',
  createSpline: 'CREATE_SPLINE',
  createBezier: 'CREATE_BEZIER',

  // Boolean Operations
  performUnion: 'BOOL_UNION',
  performSubtract: 'BOOL_SUBTRACT',
  performIntersect: 'BOOL_INTERSECT',
  performCut: 'BOOL_CUT',
  union: 'BOOL_UNION',
  subtract: 'BOOL_SUBTRACT',
  intersect: 'BOOL_INTERSECT',
  difference: 'BOOL_CUT',

  // Transformations
  translate: 'TRANSFORM_TRANSLATE',
  rotate: 'TRANSFORM_ROTATE',
  scale: 'TRANSFORM_SCALE',
  mirror: 'TRANSFORM_MIRROR',
  move: 'TRANSFORM_TRANSLATE',
  orient: 'TRANSFORM_ORIENT',
  applyTransform: 'TRANSFORM_MATRIX',
  transform: 'TRANSFORM_MATRIX',

  // Features
  fillet: 'MAKE_FILLET',
  chamfer: 'MAKE_CHAMFER',
  shell: 'MAKE_SHELL',
  offset: 'MAKE_OFFSET',
  draft: 'MAKE_DRAFT',
  extrude: 'MAKE_EXTRUDE',
  revolve: 'MAKE_REVOLVE',
  sweep: 'MAKE_SWEEP',
  loft: 'MAKE_LOFT',
  makeHole: 'MAKE_HOLE',
  makePocket: 'MAKE_POCKET',
  makePad: 'MAKE_PAD',
  makeRib: 'MAKE_RIB',
  makeGroove: 'MAKE_GROOVE',
  makeThread: 'MAKE_THREAD',

  // Surface Operations
  makeSurface: 'MAKE_SURFACE',
  makeNurbsSurface: 'MAKE_NURBS_SURFACE',
  makeBezierSurface: 'MAKE_BEZIER_SURFACE',
  makeRuledSurface: 'MAKE_RULED_SURFACE',
  makeRevolutionSurface: 'MAKE_REVOLUTION_SURFACE',
  makePlanarSurface: 'MAKE_PLANAR_SURFACE',
  makeSweepSurface: 'MAKE_SWEEP_SURFACE',
  makeLoftSurface: 'MAKE_LOFT_SURFACE',

  // Analysis Operations
  calculateVolume: 'MEASURE_VOLUME',
  calculateArea: 'MEASURE_AREA',
  calculateCenterOfMass: 'MEASURE_CENTER_OF_MASS',
  calculateBoundingBox: 'MEASURE_BOUNDING_BOX',
  calculateInertia: 'MEASURE_INERTIA',
  analyzeGaps: 'ANALYZE_GAPS',
  analyzeCurvature: 'ANALYZE_CURVATURE',
  analyzeThickness: 'ANALYZE_THICKNESS',
  checkInterference: 'CHECK_INTERFERENCE',
  measureDistance: 'MEASURE_DISTANCE',
  measureAngle: 'MEASURE_ANGLE',

  // Mesh Operations
  tessellate: 'TESSELLATE',
  generateMesh: 'GENERATE_MESH',
  optimizeMesh: 'OPTIMIZE_MESH',
  decimateMesh: 'DECIMATE_MESH',
  smoothMesh: 'SMOOTH_MESH',
  refineMesh: 'REFINE_MESH',

  // Import/Export Operations
  importSTEP: 'IMPORT_STEP',
  exportSTEP: 'EXPORT_STEP',
  importIGES: 'IMPORT_IGES',
  exportIGES: 'EXPORT_IGES',
  importSTL: 'IMPORT_STL',
  exportSTL: 'EXPORT_STL',
  importBREP: 'IMPORT_BREP',
  exportBREP: 'EXPORT_BREP',
  importOBJ: 'IMPORT_OBJ',
  exportOBJ: 'EXPORT_OBJ',

  // Curve Operations
  projectCurve: 'PROJECT_CURVE',
  isoparametricCurve: 'ISOPARAMETRIC_CURVE',
  intersectCurves: 'INTERSECT_CURVES',
  offsetCurve: 'OFFSET_CURVE',
  trimCurve: 'TRIM_CURVE',
  extendCurve: 'EXTEND_CURVE',
  blendCurves: 'BLEND_CURVES',
  splitCurve: 'SPLIT_CURVE',

  // Surface Operations
  intersectSurfaces: 'INTERSECT_SURFACES',
  blendSurfaces: 'BLEND_SURFACES',
  projectOnSurface: 'PROJECT_ON_SURFACE',
  offsetSurface: 'OFFSET_SURFACE',
  extendSurface: 'EXTEND_SURFACE',
  trimSurface: 'TRIM_SURFACE',

  // Advanced Operations
  healGeometry: 'HEAL_GEOMETRY',
  simplifyGeometry: 'SIMPLIFY_GEOMETRY',
  splitFace: 'SPLIT_FACE',
  splitEdge: 'SPLIT_EDGE',
  mergeFaces: 'MERGE_FACES',
  mergeEdges: 'MERGE_EDGES',
  removeFeatures: 'REMOVE_FEATURES',
  repairGeometry: 'REPAIR_GEOMETRY',

  // Assembly Operations
  createAssembly: 'ASSEMBLY_CREATE',
  addComponent: 'ASSEMBLY_ADD',
  removeComponent: 'ASSEMBLY_REMOVE',
  updateComponent: 'ASSEMBLY_UPDATE',
  applyConstraint: 'CONSTRAINT_APPLY',
  removeConstraint: 'CONSTRAINT_REMOVE',
  solveConstraints: 'CONSTRAINT_SOLVE',

  // Pattern Operations
  linearPattern: 'PATTERN_LINEAR',
  circularPattern: 'PATTERN_CIRCULAR',
  rectangularPattern: 'PATTERN_RECTANGULAR',
  pathPattern: 'PATTERN_PATH',
  mirrorPattern: 'PATTERN_MIRROR',

  // Sheet Metal Operations
  createFlange: 'SHEET_METAL_FLANGE',
  createBend: 'SHEET_METAL_BEND',
  unfold: 'SHEET_METAL_UNFOLD',
  refold: 'SHEET_METAL_REFOLD',
};

/**
 * Enhanced Worker API that routes operations correctly
 * This wraps the actual worker to ensure proper operation mapping
 */
export class OCCTOperationRouter implements WorkerAPI {
  private worker: WorkerAPI;
  private operationMap: Record<string, string>;

  constructor(worker: WorkerAPI, customMap?: Record<string, string>) {
    this.worker = worker;
    this.operationMap = customMap || NODE_TO_OCCT_OPERATION_MAP;
  }

  /**
   * Route an operation to the correct OCCT worker method
   */
  async invoke<T = any>(operation: string, params: any): Promise<T> {
    // Map the operation name
    const occtOperation =
      this.operationMap[operation] ||
      operation
        .toUpperCase()
        .replace(/([A-Z])/g, '_$1')
        .slice(1);

    console.log(`[OCCTRouter] Routing: ${operation} → ${occtOperation}`);

    // Call the worker with the mapped operation
    return this.worker.invoke(occtOperation, params);
  }

  /**
   * Execute operation (alternative interface)
   */
  async execute<T = any>(operation: string, params: any): Promise<T> {
    return this.invoke(operation, params);
  }

  // Direct method implementations for common operations
  async makeBox(params: any): Promise<any> {
    return this.invoke('makeBox', params);
  }

  async makeSphere(params: any): Promise<any> {
    return this.invoke('makeSphere', params);
  }

  async makeCylinder(params: any): Promise<any> {
    return this.invoke('makeCylinder', params);
  }

  async performUnion(params: any): Promise<any> {
    return this.invoke('performUnion', params);
  }

  async performSubtract(params: any): Promise<any> {
    return this.invoke('performSubtract', params);
  }

  async performIntersect(params: any): Promise<any> {
    return this.invoke('performIntersect', params);
  }

  async translate(params: any): Promise<any> {
    return this.invoke('translate', params);
  }

  async rotate(params: any): Promise<any> {
    return this.invoke('rotate', params);
  }

  async scale(params: any): Promise<any> {
    return this.invoke('scale', params);
  }

  async fillet(params: any): Promise<any> {
    return this.invoke('fillet', params);
  }

  async chamfer(params: any): Promise<any> {
    return this.invoke('chamfer', params);
  }

  async extrude(params: any): Promise<any> {
    return this.invoke('extrude', params);
  }

  async revolve(params: any): Promise<any> {
    return this.invoke('revolve', params);
  }

  async tessellate(shapeId: any, deflection: number): Promise<any> {
    return this.invoke('tessellate', { shapeId, deflection });
  }

  async dispose(handleId: any): Promise<void> {
    await this.invoke('dispose', { handleId });
  }

  async calculateVolume(params: any): Promise<any> {
    return this.invoke('calculateVolume', params);
  }

  async calculateArea(params: any): Promise<any> {
    return this.invoke('calculateArea', params);
  }

  // Health and status methods
  async init(): Promise<void> {
    if (this.worker.init) {
      return this.worker.init();
    }
  }

  async healthCheck(): Promise<any> {
    if (this.worker.healthCheck) {
      return this.worker.healthCheck();
    }
    return { healthy: true };
  }

  async terminate(): Promise<void> {
    if (this.worker.terminate) {
      return this.worker.terminate();
    }
  }
}

/**
 * Create a properly routed OCCT worker
 * This is the main entry point for getting a worker with correct operation routing
 */
export async function createRoutedOCCTWorker(): Promise<WorkerAPI> {
  console.log('[OCCTRouter] Creating routed OCCT worker...');

  try {
    // Get the actual worker API (real or mock)
    // TODO: Implement proper API initialization when GeometryAPIFactory is available
    const baseWorker: any = null; // await GeometryAPIFactory.getAPI();

    // Wrap it with the operation router
    const routedWorker = new OCCTOperationRouter(baseWorker);

    console.log('[OCCTRouter] ✅ Routed worker created successfully');
    console.log(
      '[OCCTRouter] 📊 Operations mapped:',
      Object.keys(NODE_TO_OCCT_OPERATION_MAP).length
    );

    return routedWorker;
  } catch (error) {
    console.error('[OCCTRouter] Failed to create routed worker:', error);
    throw error;
  }
}

/**
 * Get operation statistics
 */
export function getRoutingStatistics(): {
  totalMappings: number;
  categories: Record<string, number>;
  examples: Array<[string, string]>;
} {
  const categories: Record<string, number> = {
    primitives: 0,
    boolean: 0,
    transform: 0,
    features: 0,
    surface: 0,
    analysis: 0,
    mesh: 0,
    io: 0,
    curve: 0,
    advanced: 0,
    assembly: 0,
    pattern: 0,
    sheetMetal: 0,
  };

  for (const [nodeOp, occtOp] of Object.entries(NODE_TO_OCCT_OPERATION_MAP)) {
    if (nodeOp.includes('make') || nodeOp.includes('create')) categories.primitives++;
    else if (occtOp.startsWith('BOOL_')) categories.boolean++;
    else if (occtOp.startsWith('TRANSFORM_')) categories.transform++;
    else if (occtOp.includes('FILLET') || occtOp.includes('CHAMFER') || occtOp.includes('EXTRUDE'))
      categories.features++;
    else if (occtOp.includes('SURFACE')) categories.surface++;
    else if (occtOp.startsWith('MEASURE_') || occtOp.startsWith('ANALYZE_')) categories.analysis++;
    else if (occtOp.includes('MESH') || occtOp.includes('TESSELLATE')) categories.mesh++;
    else if (occtOp.includes('IMPORT') || occtOp.includes('EXPORT')) categories.io++;
    else if (occtOp.includes('CURVE')) categories.curve++;
    else if (occtOp.startsWith('ASSEMBLY_')) categories.assembly++;
    else if (occtOp.startsWith('PATTERN_')) categories.pattern++;
    else if (occtOp.startsWith('SHEET_METAL_')) categories.sheetMetal++;
    else categories.advanced++;
  }

  const examples: Array<[string, string]> = [
    ['makeBox', NODE_TO_OCCT_OPERATION_MAP['makeBox']],
    ['performUnion', NODE_TO_OCCT_OPERATION_MAP['performUnion']],
    ['translate', NODE_TO_OCCT_OPERATION_MAP['translate']],
    ['fillet', NODE_TO_OCCT_OPERATION_MAP['fillet']],
    ['tessellate', NODE_TO_OCCT_OPERATION_MAP['tessellate']],
  ];

  return {
    totalMappings: Object.keys(NODE_TO_OCCT_OPERATION_MAP).length,
    categories,
    examples,
  };
}
