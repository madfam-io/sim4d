/**
 * Measurement and Analysis Node Templates
 * Nodes for measuring geometry and analyzing CAD models
 */

import { NodeTemplate } from '../node-template';

export const measurementTemplates: NodeTemplate[] = [
  // Distance Measurements
  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'DistancePointToPoint',
    description: 'Measure distance between two points',
    operation: 'MEASURE_DISTANCE_POINT_POINT',
    occtBinding: 'measureDistancePointPoint',
    parameters: [],
    inputs: [
      { name: 'point1', type: 'Point', required: true },
      { name: 'point2', type: 'Point', required: true },
    ],
    outputs: [
      { name: 'distance', type: 'number', description: 'Distance value' },
      { name: 'vector', type: 'Vector', description: 'Vector from point1 to point2' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'DistancePointToLine',
    description: 'Measure distance from point to line',
    operation: 'MEASURE_DISTANCE_POINT_LINE',
    occtBinding: 'measureDistancePointLine',
    parameters: [],
    inputs: [
      { name: 'point', type: 'Point', required: true },
      { name: 'line', type: 'Wire', required: true },
    ],
    outputs: [
      { name: 'distance', type: 'number', description: 'Minimum distance' },
      { name: 'closestPoint', type: 'Point', description: 'Closest point on line' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'DistancePointToPlane',
    description: 'Measure distance from point to plane',
    operation: 'MEASURE_DISTANCE_POINT_PLANE',
    occtBinding: 'measureDistancePointPlane',
    parameters: [],
    inputs: [
      { name: 'point', type: 'Point', required: true },
      { name: 'plane', type: 'Face', required: true },
    ],
    outputs: [
      { name: 'distance', type: 'number', description: 'Perpendicular distance' },
      { name: 'projectedPoint', type: 'Point', description: 'Projected point on plane' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'MinimumDistance',
    description: 'Find minimum distance between two shapes',
    operation: 'MEASURE_MINIMUM_DISTANCE',
    occtBinding: 'measureMinimumDistance',
    parameters: [],
    inputs: [
      { name: 'shape1', type: 'Shape', required: true },
      { name: 'shape2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'distance', type: 'number', description: 'Minimum distance' },
      { name: 'point1', type: 'Point', description: 'Closest point on shape1' },
      { name: 'point2', type: 'Point', description: 'Closest point on shape2' },
    ],
  },

  // Angle Measurements
  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'AngleBetweenLines',
    description: 'Measure angle between two lines',
    operation: 'MEASURE_ANGLE_LINES',
    occtBinding: 'measureAngleLines',
    parameters: [
      { name: 'unit', type: 'enum', options: ['degrees', 'radians'], default: 'degrees' },
    ],
    inputs: [
      { name: 'line1', type: 'Wire', required: true },
      { name: 'line2', type: 'Wire', required: true },
    ],
    outputs: [{ name: 'angle', type: 'number', description: 'Angle value' }],
  },

  {
    category: 'Analysis',
    subcategory: 'Measurement',
    name: 'AngleBetweenPlanes',
    description: 'Measure angle between two planes',
    operation: 'MEASURE_ANGLE_PLANES',
    occtBinding: 'measureAnglePlanes',
    parameters: [
      { name: 'unit', type: 'enum', options: ['degrees', 'radians'], default: 'degrees' },
    ],
    inputs: [
      { name: 'plane1', type: 'Face', required: true },
      { name: 'plane2', type: 'Face', required: true },
    ],
    outputs: [{ name: 'angle', type: 'number', description: 'Dihedral angle' }],
  },

  // Geometric Properties
  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'CurveLength',
    description: 'Measure the length of a curve',
    operation: 'MEASURE_CURVE_LENGTH',
    occtBinding: 'measureCurveLength',
    parameters: [],
    inputs: [{ name: 'curve', type: 'Wire', required: true }],
    outputs: [{ name: 'length', type: 'number', description: 'Total curve length' }],
  },

  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'SurfaceArea',
    description: 'Calculate surface area',
    operation: 'MEASURE_SURFACE_AREA',
    occtBinding: 'measureSurfaceArea',
    parameters: [],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'area', type: 'number', description: 'Total surface area' }],
  },

  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'Volume',
    description: 'Calculate volume of a solid',
    operation: 'MEASURE_VOLUME',
    occtBinding: 'measureVolume',
    parameters: [],
    inputs: [{ name: 'solid', type: 'Solid', required: true }],
    outputs: [{ name: 'volume', type: 'number', description: 'Volume' }],
  },

  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'CenterOfMass',
    description: 'Find center of mass/gravity',
    operation: 'CALCULATE_CENTER_OF_MASS',
    occtBinding: 'calculateCenterOfMass',
    parameters: [{ name: 'density', type: 'number', default: 1, min: 0.001, max: 100000 }],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'center', type: 'Point', description: 'Center of mass' },
      { name: 'mass', type: 'number', description: 'Total mass' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'MomentOfInertia',
    description: 'Calculate moment of inertia',
    operation: 'CALCULATE_MOMENT_OF_INERTIA',
    occtBinding: 'calculateMomentOfInertia',
    parameters: [],
    inputs: [{ name: 'solid', type: 'Solid', required: true }],
    outputs: [
      { name: 'Ixx', type: 'number', description: 'Moment about X axis' },
      { name: 'Iyy', type: 'number', description: 'Moment about Y axis' },
      { name: 'Izz', type: 'number', description: 'Moment about Z axis' },
      { name: 'principalAxes', type: 'Vector[]', description: 'Principal axes' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Properties',
    name: 'BoundingBox',
    description: 'Get bounding box of shape',
    operation: 'GET_BOUNDING_BOX',
    occtBinding: 'getBoundingBox',
    parameters: [],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'min', type: 'Point', description: 'Minimum corner' },
      { name: 'max', type: 'Point', description: 'Maximum corner' },
      { name: 'center', type: 'Point', description: 'Box center' },
      { name: 'dimensions', type: 'Vector', description: 'Box dimensions (width, depth, height)' },
    ],
  },
];

export const analysisTemplates: NodeTemplate[] = [
  // Geometric Analysis
  {
    category: 'Analysis',
    subcategory: 'Geometry',
    name: 'Curvature',
    description: 'Analyze curvature at a point',
    operation: 'ANALYZE_CURVATURE',
    occtBinding: 'analyzeCurvature',
    parameters: [{ name: 'parameter', type: 'number', default: 0.5, min: 0, max: 1 }],
    inputs: [{ name: 'curve', type: 'Wire', required: true }],
    outputs: [
      { name: 'curvature', type: 'number', description: 'Curvature value' },
      { name: 'radius', type: 'number', description: 'Radius of curvature' },
      { name: 'center', type: 'Point', description: 'Center of curvature' },
      { name: 'normal', type: 'Vector', description: 'Normal vector' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Geometry',
    name: 'SurfaceCurvature',
    description: 'Analyze surface curvature',
    operation: 'ANALYZE_SURFACE_CURVATURE',
    occtBinding: 'analyzeSurfaceCurvature',
    parameters: [
      { name: 'u', type: 'number', default: 0.5, min: 0, max: 1 },
      { name: 'v', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [
      { name: 'gaussianCurvature', type: 'number', description: 'Gaussian curvature' },
      { name: 'meanCurvature', type: 'number', description: 'Mean curvature' },
      { name: 'minCurvature', type: 'number', description: 'Minimum principal curvature' },
      { name: 'maxCurvature', type: 'number', description: 'Maximum principal curvature' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Geometry',
    name: 'DraftAngle',
    description: 'Analyze draft angles for molding',
    operation: 'ANALYZE_DRAFT_ANGLE',
    occtBinding: 'analyzeDraftAngle',
    parameters: [
      { name: 'pullDirection', type: 'vector3', default: [0, 0, 1] },
      { name: 'minAngle', type: 'number', default: 1, min: 0, max: 90 },
      { name: 'maxAngle', type: 'number', default: 10, min: 0, max: 90 },
    ],
    inputs: [{ name: 'solid', type: 'Solid', required: true }],
    outputs: [
      { name: 'validFaces', type: 'Face[]', description: 'Faces with valid draft' },
      { name: 'invalidFaces', type: 'Face[]', description: 'Faces needing draft correction' },
      { name: 'verticalFaces', type: 'Face[]', description: 'Vertical faces' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Geometry',
    name: 'WallThickness',
    description: 'Analyze wall thickness',
    operation: 'ANALYZE_WALL_THICKNESS',
    occtBinding: 'analyzeWallThickness',
    parameters: [
      { name: 'minThickness', type: 'number', default: 1, min: 0.01, max: 1000 },
      { name: 'maxThickness', type: 'number', default: 10, min: 0.01, max: 1000 },
    ],
    inputs: [{ name: 'solid', type: 'Solid', required: true }],
    outputs: [
      { name: 'thinAreas', type: 'Face[]', description: 'Areas below minimum' },
      { name: 'thickAreas', type: 'Face[]', description: 'Areas above maximum' },
      { name: 'averageThickness', type: 'number', description: 'Average wall thickness' },
    ],
  },

  // Topology Analysis
  {
    category: 'Analysis',
    subcategory: 'Topology',
    name: 'TopologyInfo',
    description: 'Get topology information',
    operation: 'GET_TOPOLOGY_INFO',
    occtBinding: 'getTopologyInfo',
    parameters: [],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'vertices', type: 'number', description: 'Number of vertices' },
      { name: 'edges', type: 'number', description: 'Number of edges' },
      { name: 'faces', type: 'number', description: 'Number of faces' },
      { name: 'shells', type: 'number', description: 'Number of shells' },
      { name: 'solids', type: 'number', description: 'Number of solids' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Topology',
    name: 'IsManifold',
    description: 'Check if shape is manifold',
    operation: 'CHECK_MANIFOLD',
    occtBinding: 'checkManifold',
    parameters: [],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'isManifold', type: 'boolean', description: 'Manifold status' },
      { name: 'nonManifoldEdges', type: 'Edge[]', description: 'Non-manifold edges' },
      { name: 'nonManifoldVertices', type: 'Vertex[]', description: 'Non-manifold vertices' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Topology',
    name: 'ConnectedComponents',
    description: 'Find connected components',
    operation: 'FIND_CONNECTED_COMPONENTS',
    occtBinding: 'findConnectedComponents',
    parameters: [],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'components', type: 'Shape[]', description: 'Connected components' },
      { name: 'count', type: 'number', description: 'Number of components' },
    ],
  },

  // Collision Detection
  {
    category: 'Analysis',
    subcategory: 'Collision',
    name: 'Intersection',
    description: 'Check for intersection between shapes',
    operation: 'CHECK_INTERSECTION',
    occtBinding: 'checkIntersection',
    parameters: [],
    inputs: [
      { name: 'shape1', type: 'Shape', required: true },
      { name: 'shape2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'intersects', type: 'boolean', description: 'Intersection status' },
      { name: 'intersection', type: 'Shape', description: 'Intersection geometry' },
    ],
  },

  {
    category: 'Analysis',
    subcategory: 'Collision',
    name: 'Clearance',
    description: 'Check clearance between shapes',
    operation: 'CHECK_CLEARANCE',
    occtBinding: 'checkClearance',
    parameters: [{ name: 'minClearance', type: 'number', default: 1, min: 0, max: 10000 }],
    inputs: [
      { name: 'shape1', type: 'Shape', required: true },
      { name: 'shape2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'hasClearance', type: 'boolean', description: 'Clearance status' },
      { name: 'actualClearance', type: 'number', description: 'Actual clearance distance' },
      { name: 'violationPoints', type: 'Point[]', description: 'Points violating clearance' },
    ],
  },
];

// Export all templates
export const allMeasurementAnalysisTemplates = [...measurementTemplates, ...analysisTemplates];
