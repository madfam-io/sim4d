/**
 * Assembly & Constraints Templates - Phase 3
 * Assembly relationships and constraint solving
 */

import { NodeTemplate } from '../node-template';

/**
 * Geometric Constraints - For assembly and sketching
 */
export const constraintTemplates: NodeTemplate[] = [
  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Coincident',
    description: 'Make two entities coincident',
    operation: 'CONSTRAINT_COINCIDENT',
    occtBinding: 'constraintCoincident',
    parameters: [{ name: 'tolerance', type: 'number', default: 0.001, min: 0, max: 1 }],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]', description: 'Constrained shapes' },
      { name: 'constraint', type: 'Constraint', description: 'Constraint object' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Parallel',
    description: 'Make two entities parallel',
    operation: 'CONSTRAINT_PARALLEL',
    occtBinding: 'constraintParallel',
    parameters: [
      { name: 'offset', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'flip', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Perpendicular',
    description: 'Make two entities perpendicular',
    operation: 'CONSTRAINT_PERPENDICULAR',
    occtBinding: 'constraintPerpendicular',
    parameters: [],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Tangent',
    description: 'Make two entities tangent',
    operation: 'CONSTRAINT_TANGENT',
    occtBinding: 'constraintTangent',
    parameters: [{ name: 'inside', type: 'boolean', default: false }],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Concentric',
    description: 'Make two circular entities concentric',
    operation: 'CONSTRAINT_CONCENTRIC',
    occtBinding: 'constraintConcentric',
    parameters: [],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Distance',
    description: 'Set distance between entities',
    operation: 'CONSTRAINT_DISTANCE',
    occtBinding: 'constraintDistance',
    parameters: [
      { name: 'distance', type: 'number', default: 10, min: 0, max: 10000 },
      { name: 'minimum', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Angle',
    description: 'Set angle between entities',
    operation: 'CONSTRAINT_ANGLE',
    occtBinding: 'constraintAngle',
    parameters: [{ name: 'angle', type: 'number', default: 90, min: 0, max: 360 }],
    inputs: [
      { name: 'entity1', type: 'Shape', required: true },
      { name: 'entity2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'constrained', type: 'Shape[]' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Horizontal',
    description: 'Make entity horizontal',
    operation: 'CONSTRAINT_HORIZONTAL',
    occtBinding: 'constraintHorizontal',
    parameters: [],
    inputs: [{ name: 'entity', type: 'Shape', required: true }],
    outputs: [
      { name: 'constrained', type: 'Shape' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Vertical',
    description: 'Make entity vertical',
    operation: 'CONSTRAINT_VERTICAL',
    occtBinding: 'constraintVertical',
    parameters: [],
    inputs: [{ name: 'entity', type: 'Shape', required: true }],
    outputs: [
      { name: 'constrained', type: 'Shape' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Constraints',
    name: 'Fixed',
    description: 'Fix entity in space',
    operation: 'CONSTRAINT_FIXED',
    occtBinding: 'constraintFixed',
    parameters: [],
    inputs: [{ name: 'entity', type: 'Shape', required: true }],
    outputs: [
      { name: 'constrained', type: 'Shape' },
      { name: 'constraint', type: 'Constraint' },
    ],
  },
];

/**
 * Assembly Mates - High-level assembly relationships
 */
export const mateTemplates: NodeTemplate[] = [
  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'FaceToFace',
    description: 'Mate two faces together',
    operation: 'MATE_FACE_TO_FACE',
    occtBinding: 'mateFaceToFace',
    parameters: [
      { name: 'offset', type: 'number', default: 0, min: -1000, max: 1000 },
      { name: 'flip', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'face1', type: 'Face', required: true },
      { name: 'face2', type: 'Face', required: true },
    ],
    outputs: [
      { name: 'mated', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'EdgeToEdge',
    description: 'Mate two edges together',
    operation: 'MATE_EDGE_TO_EDGE',
    occtBinding: 'mateEdgeToEdge',
    parameters: [
      { name: 'alignment', type: 'enum', options: ['aligned', 'anti-aligned'], default: 'aligned' },
    ],
    inputs: [
      { name: 'edge1', type: 'Edge', required: true },
      { name: 'edge2', type: 'Edge', required: true },
    ],
    outputs: [
      { name: 'mated', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'PointToPoint',
    description: 'Mate two points together',
    operation: 'MATE_POINT_TO_POINT',
    occtBinding: 'matePointToPoint',
    parameters: [],
    inputs: [
      { name: 'point1', type: 'Point', required: true },
      { name: 'point2', type: 'Point', required: true },
    ],
    outputs: [
      { name: 'mated', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'AxisToAxis',
    description: 'Align two axes',
    operation: 'MATE_AXIS_TO_AXIS',
    occtBinding: 'mateAxisToAxis',
    parameters: [
      { name: 'colinear', type: 'boolean', default: true },
      { name: 'offset', type: 'number', default: 0 },
    ],
    inputs: [
      { name: 'axis1', type: 'Axis', required: true },
      { name: 'axis2', type: 'Axis', required: true },
    ],
    outputs: [
      { name: 'mated', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'PlaneToPlane',
    description: 'Mate two planes',
    operation: 'MATE_PLANE_TO_PLANE',
    occtBinding: 'matePlaneToPlane',
    parameters: [
      { name: 'distance', type: 'number', default: 0 },
      { name: 'parallel', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'plane1', type: 'Plane', required: true },
      { name: 'plane2', type: 'Plane', required: true },
    ],
    outputs: [
      { name: 'mated', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'Fastened',
    description: 'Fasten components together rigidly',
    operation: 'MATE_FASTENED',
    occtBinding: 'mateFastened',
    parameters: [],
    inputs: [
      { name: 'component1', type: 'Shape', required: true },
      { name: 'component2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'fastened', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'Gear',
    description: 'Create gear relationship',
    operation: 'MATE_GEAR',
    occtBinding: 'mateGear',
    parameters: [
      { name: 'ratio', type: 'number', default: 1, min: 0.1, max: 100 },
      { name: 'reverse', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'gear1', type: 'Shape', required: true },
      { name: 'gear2', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'geared', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'Cam',
    description: 'Create cam-follower relationship',
    operation: 'MATE_CAM',
    occtBinding: 'mateCam',
    parameters: [],
    inputs: [
      { name: 'cam', type: 'Shape', required: true },
      { name: 'follower', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'cammed', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'Slot',
    description: 'Create slot constraint',
    operation: 'MATE_SLOT',
    occtBinding: 'mateSlot',
    parameters: [{ name: 'freeRotation', type: 'boolean', default: true }],
    inputs: [
      { name: 'slot', type: 'Shape', required: true },
      { name: 'slider', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'slotted', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Mates',
    name: 'Path',
    description: 'Constrain to path',
    operation: 'MATE_PATH',
    occtBinding: 'matePath',
    parameters: [
      { name: 'position', type: 'number', default: 0, min: 0, max: 1 },
      { name: 'tangent', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'path', type: 'Wire', required: true },
      { name: 'follower', type: 'Shape', required: true },
    ],
    outputs: [
      { name: 'pathed', type: 'Shape[]' },
      { name: 'mate', type: 'Mate' },
    ],
  },
];

/**
 * Mechanical Joints - Motion constraints
 */
export const jointTemplates: NodeTemplate[] = [
  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Revolute',
    description: 'Create revolute (hinge) joint',
    operation: 'JOINT_REVOLUTE',
    occtBinding: 'jointRevolute',
    parameters: [
      { name: 'minAngle', type: 'number', default: -180, min: -360, max: 360 },
      { name: 'maxAngle', type: 'number', default: 180, min: -360, max: 360 },
    ],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'axis', type: 'Axis', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Prismatic',
    description: 'Create prismatic (sliding) joint',
    operation: 'JOINT_PRISMATIC',
    occtBinding: 'jointPrismatic',
    parameters: [
      { name: 'minDistance', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'maxDistance', type: 'number', default: 100, min: -10000, max: 10000 },
    ],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'direction', type: 'Vector', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Cylindrical',
    description: 'Create cylindrical joint',
    operation: 'JOINT_CYLINDRICAL',
    occtBinding: 'jointCylindrical',
    parameters: [
      { name: 'minDistance', type: 'number', default: 0 },
      { name: 'maxDistance', type: 'number', default: 100 },
      { name: 'minAngle', type: 'number', default: -180 },
      { name: 'maxAngle', type: 'number', default: 180 },
    ],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'axis', type: 'Axis', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Spherical',
    description: 'Create spherical (ball) joint',
    operation: 'JOINT_SPHERICAL',
    occtBinding: 'jointSpherical',
    parameters: [{ name: 'coneAngle', type: 'number', default: 45, min: 0, max: 180 }],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'center', type: 'Point', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Planar',
    description: 'Create planar joint',
    operation: 'JOINT_PLANAR',
    occtBinding: 'jointPlanar',
    parameters: [],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'plane', type: 'Plane', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Universal',
    description: 'Create universal joint',
    operation: 'JOINT_UNIVERSAL',
    occtBinding: 'jointUniversal',
    parameters: [],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'center', type: 'Point', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Fixed',
    description: 'Create fixed joint',
    operation: 'JOINT_FIXED',
    occtBinding: 'jointFixed',
    parameters: [],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Screw',
    description: 'Create screw joint',
    operation: 'JOINT_SCREW',
    occtBinding: 'jointScrew',
    parameters: [{ name: 'pitch', type: 'number', default: 1, min: 0.01, max: 100 }],
    inputs: [
      { name: 'part1', type: 'Shape', required: true },
      { name: 'part2', type: 'Shape', required: true },
      { name: 'axis', type: 'Axis', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'Belt',
    description: 'Create belt/chain constraint',
    operation: 'JOINT_BELT',
    occtBinding: 'jointBelt',
    parameters: [{ name: 'ratio', type: 'number', default: 1, min: 0.1, max: 100 }],
    inputs: [
      { name: 'pulley1', type: 'Shape', required: true },
      { name: 'pulley2', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Joints',
    name: 'RackPinion',
    description: 'Create rack and pinion joint',
    operation: 'JOINT_RACK_PINION',
    occtBinding: 'jointRackPinion',
    parameters: [{ name: 'module', type: 'number', default: 1, min: 0.1, max: 100 }],
    inputs: [
      { name: 'rack', type: 'Shape', required: true },
      { name: 'pinion', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'joint', type: 'Joint' }],
  },
];

/**
 * Assembly Patterns - Configurations and arrays
 */
export const assemblyPatternTemplates: NodeTemplate[] = [
  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'ComponentPattern',
    description: 'Pattern components in assembly',
    operation: 'ASSEMBLY_COMPONENT_PATTERN',
    occtBinding: 'assemblyComponentPattern',
    parameters: [
      {
        name: 'patternType',
        type: 'enum',
        options: ['linear', 'circular', 'mirror'],
        default: 'linear',
      },
      { name: 'count', type: 'number', default: 3, min: 2, max: 100 },
      { name: 'spacing', type: 'number', default: 100, min: 0.1, max: 10000 },
    ],
    inputs: [
      { name: 'component', type: 'Shape', required: true },
      { name: 'mates', type: 'Mate[]', required: false },
    ],
    outputs: [{ name: 'pattern', type: 'Shape[]' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'FlexibleSubAssembly',
    description: 'Create flexible sub-assembly',
    operation: 'ASSEMBLY_FLEXIBLE',
    occtBinding: 'assemblyFlexible',
    parameters: [
      { name: 'flexibility', type: 'enum', options: ['rigid', 'flexible'], default: 'flexible' },
    ],
    inputs: [
      { name: 'components', type: 'Shape[]', required: true },
      { name: 'joints', type: 'Joint[]', required: false },
    ],
    outputs: [{ name: 'subAssembly', type: 'Assembly' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'Configuration',
    description: 'Create assembly configuration',
    operation: 'ASSEMBLY_CONFIGURATION',
    occtBinding: 'assemblyConfiguration',
    parameters: [
      { name: 'name', type: 'string', default: 'Default' },
      { name: 'suppressedComponents', type: 'string', default: '' },
    ],
    inputs: [{ name: 'assembly', type: 'Assembly', required: true }],
    outputs: [{ name: 'configuration', type: 'Configuration' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'ExplodedView',
    description: 'Create exploded view',
    operation: 'ASSEMBLY_EXPLODED_VIEW',
    occtBinding: 'assemblyExplodedView',
    parameters: [
      { name: 'distance', type: 'number', default: 100, min: 0, max: 10000 },
      { name: 'autoSpace', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'assembly', type: 'Assembly', required: true }],
    outputs: [
      { name: 'exploded', type: 'Shape[]' },
      { name: 'paths', type: 'Wire[]' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'BillOfMaterials',
    description: 'Generate bill of materials',
    operation: 'ASSEMBLY_BOM',
    occtBinding: 'assemblyBOM',
    parameters: [
      { name: 'includeSubAssemblies', type: 'boolean', default: true },
      { name: 'groupIdentical', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'assembly', type: 'Assembly', required: true }],
    outputs: [{ name: 'bom', type: 'BOM' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'InterferenceCheck',
    description: 'Check for interferences',
    operation: 'ASSEMBLY_INTERFERENCE',
    occtBinding: 'assemblyInterference',
    parameters: [{ name: 'clearance', type: 'number', default: 0, min: 0, max: 100 }],
    inputs: [{ name: 'assembly', type: 'Assembly', required: true }],
    outputs: [
      { name: 'interferences', type: 'Interference[]' },
      { name: 'hasInterference', type: 'boolean' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'MotionStudy',
    description: 'Analyze assembly motion',
    operation: 'ASSEMBLY_MOTION',
    occtBinding: 'assemblyMotion',
    parameters: [
      { name: 'steps', type: 'number', default: 10, min: 2, max: 100 },
      { name: 'duration', type: 'number', default: 1, min: 0.1, max: 100 },
    ],
    inputs: [
      { name: 'assembly', type: 'Assembly', required: true },
      { name: 'drivers', type: 'Driver[]', required: true },
    ],
    outputs: [
      { name: 'frames', type: 'Frame[]' },
      { name: 'collisions', type: 'Collision[]' },
    ],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'Envelope',
    description: 'Create assembly envelope',
    operation: 'ASSEMBLY_ENVELOPE',
    occtBinding: 'assemblyEnvelope',
    parameters: [
      { name: 'type', type: 'enum', options: ['bounding', 'swept', 'motion'], default: 'bounding' },
    ],
    inputs: [{ name: 'assembly', type: 'Assembly', required: true }],
    outputs: [{ name: 'envelope', type: 'Shape' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'SmartFasteners',
    description: 'Add smart fasteners',
    operation: 'ASSEMBLY_SMART_FASTENERS',
    occtBinding: 'assemblySmartFasteners',
    parameters: [
      { name: 'type', type: 'enum', options: ['bolt', 'screw', 'rivet', 'weld'], default: 'bolt' },
      { name: 'size', type: 'number', default: 10, min: 1, max: 100 },
      { name: 'autoSize', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'holes', type: 'Face[]', required: true }],
    outputs: [{ name: 'fasteners', type: 'Shape[]' }],
  },

  {
    category: 'Assembly',
    subcategory: 'Patterns',
    name: 'ContactSet',
    description: 'Define contact sets',
    operation: 'ASSEMBLY_CONTACT_SET',
    occtBinding: 'assemblyContactSet',
    parameters: [
      {
        name: 'type',
        type: 'enum',
        options: ['bonded', 'no_penetration', 'frictionless'],
        default: 'no_penetration',
      },
      { name: 'friction', type: 'number', default: 0.3, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'faces1', type: 'Face[]', required: true },
      { name: 'faces2', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'contactSet', type: 'ContactSet' }],
  },
];

// Export all templates
export const allAssemblyTemplates = [
  ...constraintTemplates,
  ...mateTemplates,
  ...jointTemplates,
  ...assemblyPatternTemplates,
];
