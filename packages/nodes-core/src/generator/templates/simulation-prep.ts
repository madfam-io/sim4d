/**
 * Simulation Prep Templates - Phase 10
 * FEA preparation, CFD preparation, kinematics setup
 */

import { NodeTemplate } from '../node-template';

/**
 * FEA Preparation
 */
export const feaPreparationTemplates: NodeTemplate[] = [
  {
    category: 'Simulation',
    subcategory: 'FEA',
    name: 'MeshForFEA',
    description: 'Generate FEA-ready mesh',
    operation: 'MESH_FOR_FEA',
    occtBinding: 'meshForFEA',
    parameters: [
      {
        name: 'elementType',
        type: 'enum',
        options: ['tet4', 'tet10', 'hex8', 'hex20', 'auto'],
        default: 'auto',
      },
      { name: 'elementSize', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'refinementZones', type: 'boolean', default: true },
      { name: 'qualityTarget', type: 'number', default: 0.8, min: 0.3, max: 1 },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'refinementRegions', type: 'Shape[]', required: false },
    ],
    outputs: [
      { name: 'feaMesh', type: 'Mesh' },
      { name: 'qualityReport', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'FEA',
    name: 'ApplyLoads',
    description: 'Define load conditions',
    operation: 'APPLY_LOADS',
    occtBinding: 'applyLoads',
    parameters: [
      {
        name: 'loadType',
        type: 'enum',
        options: ['force', 'pressure', 'torque', 'gravity', 'thermal'],
        default: 'force',
      },
      { name: 'magnitude', type: 'number', default: 1000, min: 0, max: 1000000 },
      { name: 'direction', type: 'vector3', default: [0, 0, -1] },
      { name: 'units', type: 'enum', options: ['N', 'kN', 'lbf', 'Pa', 'MPa'], default: 'N' },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'applicationFaces', type: 'Face[]', required: true },
    ],
    outputs: [
      { name: 'loadedMesh', type: 'Mesh' },
      { name: 'loadData', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'FEA',
    name: 'ApplyConstraints',
    description: 'Define boundary conditions',
    operation: 'APPLY_CONSTRAINTS',
    occtBinding: 'applyConstraints',
    parameters: [
      {
        name: 'constraintType',
        type: 'enum',
        options: ['fixed', 'pinned', 'roller', 'spring', 'displacement'],
        default: 'fixed',
      },
      {
        name: 'dof',
        type: 'boolean[]',
        default: [true, true, true, true, true, true],
        description: 'X,Y,Z,RX,RY,RZ',
      },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'constraintFaces', type: 'Face[]', required: true },
    ],
    outputs: [
      { name: 'constrainedMesh', type: 'Mesh' },
      { name: 'constraintData', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'FEA',
    name: 'MaterialAssign',
    description: 'Assign material properties',
    operation: 'MATERIAL_ASSIGN',
    occtBinding: 'materialAssign',
    parameters: [
      {
        name: 'material',
        type: 'enum',
        options: ['steel', 'aluminum', 'titanium', 'plastic', 'composite', 'custom'],
        default: 'steel',
      },
      {
        name: 'youngsModulus',
        type: 'number',
        default: 200000,
        min: 1,
        max: 1000000,
        description: 'MPa',
      },
      { name: 'poissonsRatio', type: 'number', default: 0.3, min: 0, max: 0.5 },
      { name: 'density', type: 'number', default: 7850, min: 1, max: 20000, description: 'kg/m³' },
      {
        name: 'yieldStrength',
        type: 'number',
        default: 250,
        min: 1,
        max: 5000,
        description: 'MPa',
      },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'bodies', type: 'Shape[]', required: false },
    ],
    outputs: [
      { name: 'materializedMesh', type: 'Mesh' },
      { name: 'materialData', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'FEA',
    name: 'ExportFEA',
    description: 'Export for FEA software',
    operation: 'EXPORT_FEA',
    occtBinding: 'exportFEA',
    parameters: [
      {
        name: 'format',
        type: 'enum',
        options: ['nastran', 'abaqus', 'ansys', 'calculix'],
        default: 'nastran',
      },
      { name: 'includeLoads', type: 'boolean', default: true },
      { name: 'includeConstraints', type: 'boolean', default: true },
      { name: 'includeMaterials', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'feaModel', type: 'Mesh', required: true },
      { name: 'analysisData', type: 'Data', required: false },
    ],
    outputs: [{ name: 'feaFile', type: 'Data' }],
  },
];

/**
 * CFD Preparation
 */
export const cfdPreparationTemplates: NodeTemplate[] = [
  {
    category: 'Simulation',
    subcategory: 'CFD',
    name: 'FluidDomain',
    description: 'Create fluid domain',
    operation: 'FLUID_DOMAIN',
    occtBinding: 'fluidDomain',
    parameters: [
      {
        name: 'domainType',
        type: 'enum',
        options: ['internal', 'external', 'both'],
        default: 'external',
      },
      {
        name: 'boundingBoxScale',
        type: 'vector3',
        default: [3, 3, 3],
        description: 'Domain size multiplier',
      },
      { name: 'refinementDistance', type: 'number', default: 10, min: 1, max: 1000 },
    ],
    inputs: [{ name: 'geometry', type: 'Shape', required: true }],
    outputs: [
      { name: 'fluidDomain', type: 'Shape' },
      { name: 'walls', type: 'Face[]' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'CFD',
    name: 'BoundaryLayers',
    description: 'Add boundary layer mesh',
    operation: 'BOUNDARY_LAYERS',
    occtBinding: 'boundaryLayers',
    parameters: [
      { name: 'firstLayerHeight', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'growthRate', type: 'number', default: 1.2, min: 1, max: 2 },
      { name: 'numberOfLayers', type: 'number', default: 5, min: 1, max: 20, step: 1 },
      { name: 'transitionRatio', type: 'number', default: 0.5, min: 0.1, max: 1 },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'wallFaces', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'layeredMesh', type: 'Mesh' }],
  },

  {
    category: 'Simulation',
    subcategory: 'CFD',
    name: 'InletOutlet',
    description: 'Define inlet/outlet conditions',
    operation: 'INLET_OUTLET',
    occtBinding: 'inletOutlet',
    parameters: [
      {
        name: 'boundaryType',
        type: 'enum',
        options: [
          'velocity-inlet',
          'pressure-inlet',
          'mass-flow-inlet',
          'pressure-outlet',
          'outflow',
        ],
        default: 'velocity-inlet',
      },
      { name: 'velocity', type: 'number', default: 1, min: 0, max: 1000, description: 'm/s' },
      {
        name: 'pressure',
        type: 'number',
        default: 101325,
        min: 0,
        max: 10000000,
        description: 'Pa',
      },
      { name: 'temperature', type: 'number', default: 293, min: 0, max: 1000, description: 'K' },
    ],
    inputs: [
      { name: 'mesh', type: 'Mesh', required: true },
      { name: 'boundaryFaces', type: 'Face[]', required: true },
    ],
    outputs: [
      { name: 'boundaryMesh', type: 'Mesh' },
      { name: 'boundaryData', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'CFD',
    name: 'FluidProperties',
    description: 'Set fluid properties',
    operation: 'FLUID_PROPERTIES',
    occtBinding: 'fluidProperties',
    parameters: [
      { name: 'fluid', type: 'enum', options: ['air', 'water', 'oil', 'custom'], default: 'air' },
      {
        name: 'density',
        type: 'number',
        default: 1.225,
        min: 0.001,
        max: 20000,
        description: 'kg/m³',
      },
      {
        name: 'viscosity',
        type: 'number',
        default: 1.81e-5,
        min: 1e-10,
        max: 100,
        description: 'Pa·s',
      },
      { name: 'compressible', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'domain', type: 'Shape', required: true }],
    outputs: [
      { name: 'fluidDomain', type: 'Shape' },
      { name: 'fluidData', type: 'Data' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'CFD',
    name: 'ExportCFD',
    description: 'Export for CFD software',
    operation: 'EXPORT_CFD',
    occtBinding: 'exportCFD',
    parameters: [
      {
        name: 'format',
        type: 'enum',
        options: ['openfoam', 'fluent', 'cfx', 'star-ccm'],
        default: 'openfoam',
      },
      {
        name: 'meshFormat',
        type: 'enum',
        options: ['polyhedral', 'tetrahedral', 'hexahedral'],
        default: 'polyhedral',
      },
    ],
    inputs: [
      { name: 'cfdModel', type: 'Mesh', required: true },
      { name: 'setupData', type: 'Data', required: true },
    ],
    outputs: [{ name: 'cfdFiles', type: 'Data' }],
  },
];

/**
 * Kinematics Setup
 */
export const kinematicsTemplates: NodeTemplate[] = [
  {
    category: 'Simulation',
    subcategory: 'Kinematics',
    name: 'JointDefinition',
    description: 'Define kinematic joint',
    operation: 'JOINT_DEFINITION',
    occtBinding: 'jointDefinition',
    parameters: [
      {
        name: 'jointType',
        type: 'enum',
        options: ['revolute', 'prismatic', 'cylindrical', 'spherical', 'planar', 'fixed'],
        default: 'revolute',
      },
      { name: 'axis', type: 'vector3', default: [0, 0, 1] },
      { name: 'minLimit', type: 'number', default: -180, min: -360, max: 360 },
      { name: 'maxLimit', type: 'number', default: 180, min: -360, max: 360 },
    ],
    inputs: [
      { name: 'body1', type: 'Shape', required: true },
      { name: 'body2', type: 'Shape', required: true },
      { name: 'jointLocation', type: 'Point', required: true },
    ],
    outputs: [
      { name: 'joint', type: 'Data' },
      { name: 'assembly', type: 'Shape' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'Kinematics',
    name: 'MotionDriver',
    description: 'Define motion driver',
    operation: 'MOTION_DRIVER',
    occtBinding: 'motionDriver',
    parameters: [
      {
        name: 'motionType',
        type: 'enum',
        options: ['constant', 'harmonic', 'profile', 'expression'],
        default: 'constant',
      },
      { name: 'velocity', type: 'number', default: 1, min: -1000, max: 1000 },
      { name: 'acceleration', type: 'number', default: 0, min: -1000, max: 1000 },
      { name: 'period', type: 'number', default: 1, min: 0.001, max: 100 },
    ],
    inputs: [
      { name: 'joint', type: 'Data', required: true },
      { name: 'motionProfile', type: 'Data', required: false },
    ],
    outputs: [{ name: 'drivenJoint', type: 'Data' }],
  },

  {
    category: 'Simulation',
    subcategory: 'Kinematics',
    name: 'CollisionDetection',
    description: 'Setup collision detection',
    operation: 'COLLISION_DETECTION',
    occtBinding: 'collisionDetection',
    parameters: [
      {
        name: 'detectionType',
        type: 'enum',
        options: ['discrete', 'continuous'],
        default: 'discrete',
      },
      { name: 'tolerance', type: 'number', default: 0.1, min: 0.001, max: 10 },
      { name: 'includeSelfCollision', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'bodies', type: 'Shape[]', required: true }],
    outputs: [{ name: 'collisionPairs', type: 'Data' }],
  },

  {
    category: 'Simulation',
    subcategory: 'Kinematics',
    name: 'ForwardKinematics',
    description: 'Calculate forward kinematics',
    operation: 'FORWARD_KINEMATICS',
    occtBinding: 'forwardKinematics',
    parameters: [
      { name: 'timeStep', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'duration', type: 'number', default: 1, min: 0.01, max: 100 },
    ],
    inputs: [
      { name: 'mechanism', type: 'Data', required: true },
      { name: 'jointValues', type: 'number[]', required: true },
    ],
    outputs: [
      { name: 'endEffectorPose', type: 'Data' },
      { name: 'trajectory', type: 'Wire' },
    ],
  },

  {
    category: 'Simulation',
    subcategory: 'Kinematics',
    name: 'InverseKinematics',
    description: 'Calculate inverse kinematics',
    operation: 'INVERSE_KINEMATICS',
    occtBinding: 'inverseKinematics',
    parameters: [
      { name: 'solver', type: 'enum', options: ['jacobian', 'ccd', 'fabrik'], default: 'jacobian' },
      { name: 'maxIterations', type: 'number', default: 100, min: 10, max: 1000, step: 10 },
      { name: 'tolerance', type: 'number', default: 0.001, min: 0.0001, max: 0.1 },
    ],
    inputs: [
      { name: 'mechanism', type: 'Data', required: true },
      { name: 'targetPose', type: 'Data', required: true },
    ],
    outputs: [
      { name: 'jointValues', type: 'number[]' },
      { name: 'reachable', type: 'boolean' },
    ],
  },
];

// Export all templates
export const allSimulationPrepTemplates = [
  ...feaPreparationTemplates,
  ...cfdPreparationTemplates,
  ...kinematicsTemplates,
];
