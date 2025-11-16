/**
 * Surface Modeling Templates - Phase 6
 * NURBS surfaces, curves, and advanced surface analysis
 */

import { NodeTemplate } from '../node-template';

/**
 * NURBS Surfaces
 */
export const nurbsSurfaceTemplates: NodeTemplate[] = [
  {
    category: 'Surface',
    subcategory: 'NURBS',
    name: 'NurbsSurface',
    description: 'Create NURBS surface from control points',
    operation: 'NURBS_SURFACE',
    occtBinding: 'nurbsSurface',
    parameters: [
      { name: 'degreeU', type: 'number', default: 3, min: 1, max: 10, step: 1 },
      { name: 'degreeV', type: 'number', default: 3, min: 1, max: 10, step: 1 },
      { name: 'periodicU', type: 'boolean', default: false },
      { name: 'periodicV', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'controlPoints', type: 'Point[][]', required: true },
      { name: 'weights', type: 'number[][]', required: false },
      { name: 'knotsU', type: 'number[]', required: false },
      { name: 'knotsV', type: 'number[]', required: false },
    ],
    outputs: [{ name: 'surface', type: 'Face' }],
  },

  {
    category: 'Surface',
    subcategory: 'NURBS',
    name: 'NetworkSurface',
    description: 'Create surface from curve network',
    operation: 'NETWORK_SURFACE',
    occtBinding: 'networkSurface',
    parameters: [
      { name: 'continuity', type: 'enum', options: ['G0', 'G1', 'G2'], default: 'G1' },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
    ],
    inputs: [
      { name: 'uCurves', type: 'Wire[]', required: true },
      { name: 'vCurves', type: 'Wire[]', required: true },
    ],
    outputs: [{ name: 'surface', type: 'Face' }],
  },

  {
    category: 'Surface',
    subcategory: 'NURBS',
    name: 'SurfaceFromPoints',
    description: 'Fit surface through points',
    operation: 'SURFACE_FROM_POINTS',
    occtBinding: 'surfaceFromPoints',
    parameters: [
      { name: 'degreeU', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'degreeV', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'smoothness', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'points', type: 'Point[]', required: true },
      { name: 'uCount', type: 'number', required: true },
      { name: 'vCount', type: 'number', required: true },
    ],
    outputs: [{ name: 'surface', type: 'Face' }],
  },

  {
    category: 'Surface',
    subcategory: 'NURBS',
    name: 'CoonsPatch',
    description: 'Create Coons patch surface',
    operation: 'COONS_PATCH',
    occtBinding: 'coonsPatch',
    parameters: [],
    inputs: [
      { name: 'edge1', type: 'Edge', required: true },
      { name: 'edge2', type: 'Edge', required: true },
      { name: 'edge3', type: 'Edge', required: true },
      { name: 'edge4', type: 'Edge', required: true },
    ],
    outputs: [{ name: 'surface', type: 'Face' }],
  },

  {
    category: 'Surface',
    subcategory: 'NURBS',
    name: 'GordonSurface',
    description: 'Create Gordon surface',
    operation: 'GORDON_SURFACE',
    occtBinding: 'gordonSurface',
    parameters: [],
    inputs: [
      { name: 'uCurves', type: 'Wire[]', required: true },
      { name: 'vCurves', type: 'Wire[]', required: true },
      { name: 'points', type: 'Point[][]', required: false },
    ],
    outputs: [{ name: 'surface', type: 'Face' }],
  },
];

/**
 * NURBS Curves
 */
export const nurbsCurveTemplates: NodeTemplate[] = [
  {
    category: 'Surface',
    subcategory: 'Curves',
    name: 'NurbsCurve',
    description: 'Create NURBS curve',
    operation: 'NURBS_CURVE',
    occtBinding: 'nurbsCurve',
    parameters: [
      { name: 'degree', type: 'number', default: 3, min: 1, max: 10, step: 1 },
      { name: 'periodic', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'controlPoints', type: 'Point[]', required: true },
      { name: 'weights', type: 'number[]', required: false },
      { name: 'knots', type: 'number[]', required: false },
    ],
    outputs: [{ name: 'curve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'Curves',
    name: 'InterpolateCurve',
    description: 'Interpolate curve through points',
    operation: 'INTERPOLATE_CURVE',
    occtBinding: 'interpolateCurve',
    parameters: [
      { name: 'degree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'periodic', type: 'boolean', default: false },
      { name: 'tangentStart', type: 'vector3', default: null },
      { name: 'tangentEnd', type: 'vector3', default: null },
    ],
    inputs: [{ name: 'points', type: 'Point[]', required: true }],
    outputs: [{ name: 'curve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'Curves',
    name: 'ApproximateCurve',
    description: 'Approximate points with curve',
    operation: 'APPROXIMATE_CURVE',
    occtBinding: 'approximateCurve',
    parameters: [
      { name: 'degree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'smoothness', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [{ name: 'points', type: 'Point[]', required: true }],
    outputs: [{ name: 'curve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'Curves',
    name: 'BlendCurve',
    description: 'Blend between two curves',
    operation: 'BLEND_CURVE',
    occtBinding: 'blendCurve',
    parameters: [
      { name: 'continuityStart', type: 'enum', options: ['G0', 'G1', 'G2', 'G3'], default: 'G1' },
      { name: 'continuityEnd', type: 'enum', options: ['G0', 'G1', 'G2', 'G3'], default: 'G1' },
      { name: 'bulge', type: 'number', default: 1, min: 0.1, max: 10 },
    ],
    inputs: [
      { name: 'curve1', type: 'Wire', required: true },
      { name: 'curve2', type: 'Wire', required: true },
      { name: 'point1', type: 'Point', required: false },
      { name: 'point2', type: 'Point', required: false },
    ],
    outputs: [{ name: 'blendCurve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'Curves',
    name: 'CompositeCurve',
    description: 'Create composite curve',
    operation: 'COMPOSITE_CURVE',
    occtBinding: 'compositeCurve',
    parameters: [
      { name: 'continuity', type: 'enum', options: ['G0', 'G1', 'G2'], default: 'G1' },
      { name: 'mergeTolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
    ],
    inputs: [{ name: 'curves', type: 'Wire[]', required: true }],
    outputs: [{ name: 'composite', type: 'Wire' }],
  },
];

/**
 * Surface Analysis
 */
export const surfaceAnalysisTemplates: NodeTemplate[] = [
  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'CurvatureAnalysis',
    description: 'Analyze surface curvature',
    operation: 'CURVATURE_ANALYSIS',
    occtBinding: 'curvatureAnalysis',
    parameters: [
      {
        name: 'analysisType',
        type: 'enum',
        options: ['gaussian', 'mean', 'principal', 'radius'],
        default: 'gaussian',
      },
      { name: 'sampleDensity', type: 'number', default: 50, min: 10, max: 200, step: 1 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [
      { name: 'analysis', type: 'Data' },
      { name: 'visualization', type: 'Shape' },
    ],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'ZebraAnalysis',
    description: 'Zebra stripe analysis',
    operation: 'ZEBRA_ANALYSIS',
    occtBinding: 'zebraAnalysis',
    parameters: [
      { name: 'stripeCount', type: 'number', default: 20, min: 5, max: 100, step: 1 },
      { name: 'stripeDirection', type: 'vector3', default: [0, 0, 1] },
      { name: 'stripeWidth', type: 'number', default: 1, min: 0.1, max: 10 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'stripes', type: 'Wire[]' }],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'DraftAnalysis',
    description: 'Analyze draft angles',
    operation: 'DRAFT_ANALYSIS',
    occtBinding: 'draftAnalysis',
    parameters: [
      { name: 'pullDirection', type: 'vector3', default: [0, 0, 1] },
      { name: 'requiredAngle', type: 'number', default: 3, min: 0, max: 90 },
      { name: 'colorMapping', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'analysis', type: 'Data' },
      { name: 'problematicFaces', type: 'Face[]' },
    ],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'ContinuityCheck',
    description: 'Check surface continuity',
    operation: 'CONTINUITY_CHECK',
    occtBinding: 'continuityCheck',
    parameters: [
      { name: 'checkType', type: 'enum', options: ['G0', 'G1', 'G2', 'G3'], default: 'G1' },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
    ],
    inputs: [
      { name: 'surface1', type: 'Face', required: true },
      { name: 'surface2', type: 'Face', required: true },
      { name: 'edge', type: 'Edge', required: false },
    ],
    outputs: [
      { name: 'isContinuous', type: 'boolean' },
      { name: 'deviations', type: 'Data' },
    ],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'SurfaceDeviation',
    description: 'Measure surface deviation',
    operation: 'SURFACE_DEVIATION',
    occtBinding: 'surfaceDeviation',
    parameters: [
      { name: 'sampleCount', type: 'number', default: 1000, min: 100, max: 10000, step: 100 },
    ],
    inputs: [
      { name: 'surface1', type: 'Face', required: true },
      { name: 'surface2', type: 'Face', required: true },
    ],
    outputs: [
      { name: 'maxDeviation', type: 'number' },
      { name: 'avgDeviation', type: 'number' },
      { name: 'deviationMap', type: 'Data' },
    ],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'ReflectionLines',
    description: 'Reflection line analysis',
    operation: 'REFLECTION_LINES',
    occtBinding: 'reflectionLines',
    parameters: [
      { name: 'lineCount', type: 'number', default: 10, min: 3, max: 50, step: 1 },
      { name: 'viewDirection', type: 'vector3', default: [0, 0, 1] },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'reflectionLines', type: 'Wire[]' }],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'IsocurveExtract',
    description: 'Extract isocurves',
    operation: 'ISOCURVE_EXTRACT',
    occtBinding: 'isocurveExtract',
    parameters: [
      { name: 'direction', type: 'enum', options: ['U', 'V', 'both'], default: 'both' },
      { name: 'count', type: 'number', default: 10, min: 1, max: 100, step: 1 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'isocurves', type: 'Wire[]' }],
  },

  {
    category: 'Surface',
    subcategory: 'Analysis',
    name: 'SectionCurves',
    description: 'Extract section curves',
    operation: 'SECTION_CURVES',
    occtBinding: 'sectionCurves',
    parameters: [
      { name: 'planeNormal', type: 'vector3', default: [0, 0, 1] },
      { name: 'spacing', type: 'number', default: 10, min: 0.1, max: 1000 },
      { name: 'count', type: 'number', default: 10, min: 1, max: 100, step: 1 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'sections', type: 'Wire[]' }],
  },
];

/**
 * Curve Operations
 */
export const curveOperationTemplates: NodeTemplate[] = [
  {
    category: 'Surface',
    subcategory: 'CurveOps',
    name: 'ProjectCurve',
    description: 'Project curve onto surface',
    operation: 'PROJECT_CURVE',
    occtBinding: 'projectCurve',
    parameters: [
      { name: 'projectionDirection', type: 'vector3', default: [0, 0, -1] },
      { name: 'projectBoth', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'curve', type: 'Wire', required: true },
      { name: 'surface', type: 'Face', required: true },
    ],
    outputs: [{ name: 'projectedCurve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'CurveOps',
    name: 'IntersectCurves',
    description: 'Find curve intersections',
    operation: 'INTERSECT_CURVES',
    occtBinding: 'intersectCurves',
    parameters: [
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'extend', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'curve1', type: 'Wire', required: true },
      { name: 'curve2', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'intersectionPoints', type: 'Point[]' }],
  },

  {
    category: 'Surface',
    subcategory: 'CurveOps',
    name: 'CurveOnSurface',
    description: 'Create curve on surface',
    operation: 'CURVE_ON_SURFACE',
    occtBinding: 'curveOnSurface',
    parameters: [],
    inputs: [
      { name: 'surface', type: 'Face', required: true },
      { name: 'uvPoints', type: 'Point2D[]', required: true },
    ],
    outputs: [{ name: 'curve', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'CurveOps',
    name: 'GeodesicCurve',
    description: 'Create geodesic curve',
    operation: 'GEODESIC_CURVE',
    occtBinding: 'geodesicCurve',
    parameters: [],
    inputs: [
      { name: 'surface', type: 'Face', required: true },
      { name: 'startPoint', type: 'Point', required: true },
      { name: 'endPoint', type: 'Point', required: true },
    ],
    outputs: [{ name: 'geodesic', type: 'Wire' }],
  },

  {
    category: 'Surface',
    subcategory: 'CurveOps',
    name: 'IsoparametricCurve',
    description: 'Extract isoparametric curve',
    operation: 'ISOPARAMETRIC_CURVE',
    occtBinding: 'isoparametricCurve',
    parameters: [
      { name: 'direction', type: 'enum', options: ['U', 'V'], default: 'U' },
      { name: 'parameter', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'isoCurve', type: 'Wire' }],
  },
];

// Export all templates
export const allSurfaceModelingTemplates = [
  ...nurbsSurfaceTemplates,
  ...nurbsCurveTemplates,
  ...surfaceAnalysisTemplates,
  ...curveOperationTemplates,
];
