/**
 * Advanced Operations Templates - Phase 5
 * Complex 3D operations: loft, sweep, shell, draft, etc.
 */

import { NodeTemplate } from '../node-template';

/**
 * Sweep and Loft Operations
 */
export const sweepLoftTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Sweep',
    name: 'Sweep',
    description: 'Sweep profile along path',
    operation: 'SWEEP',
    occtBinding: 'sweep',
    parameters: [
      {
        name: 'twistAngle',
        type: 'number',
        default: 0,
        min: -360,
        max: 360,
        description: 'Twist along path',
      },
      {
        name: 'scaleFactor',
        type: 'number',
        default: 1,
        min: 0.01,
        max: 100,
        description: 'Scale at end',
      },
      { name: 'keepOrientation', type: 'boolean', default: false },
      { name: 'solid', type: 'boolean', default: true, description: 'Create solid or surface' },
    ],
    inputs: [
      { name: 'profile', type: 'Wire', required: true },
      { name: 'path', type: 'Wire', required: true },
      { name: 'auxiliarySpine', type: 'Wire', required: false },
    ],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Sweep',
    name: 'HelicalSweep',
    description: 'Sweep profile along helix',
    operation: 'HELICAL_SWEEP',
    occtBinding: 'helicalSweep',
    parameters: [
      { name: 'pitch', type: 'number', default: 10, min: 0.1, max: 1000 },
      { name: 'height', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'turns', type: 'number', default: 5, min: 0.1, max: 1000 },
      { name: 'radius', type: 'number', default: 20, min: 0.1, max: 10000 },
      { name: 'leftHanded', type: 'boolean', default: false },
      { name: 'taper', type: 'number', default: 0, min: -45, max: 45 },
    ],
    inputs: [
      { name: 'profile', type: 'Wire', required: true },
      { name: 'axis', type: 'Axis', required: false },
    ],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Loft',
    name: 'Loft',
    description: 'Loft between profiles',
    operation: 'LOFT',
    occtBinding: 'loft',
    parameters: [
      {
        name: 'ruled',
        type: 'boolean',
        default: false,
        description: 'Straight sections between profiles',
      },
      {
        name: 'closed',
        type: 'boolean',
        default: false,
        description: 'Close loft to first profile',
      },
      { name: 'solid', type: 'boolean', default: true },
      { name: 'maxDegree', type: 'number', default: 3, min: 1, max: 10 },
    ],
    inputs: [
      { name: 'profiles', type: 'Wire[]', required: true },
      { name: 'guides', type: 'Wire[]', required: false },
      { name: 'centerLine', type: 'Wire', required: false },
    ],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Loft',
    name: 'BlendSurface',
    description: 'Blend between surfaces',
    operation: 'BLEND_SURFACE',
    occtBinding: 'blendSurface',
    parameters: [
      { name: 'continuity', type: 'enum', options: ['G0', 'G1', 'G2'], default: 'G1' },
      { name: 'blendFactor', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'surface1', type: 'Face', required: true },
      { name: 'surface2', type: 'Face', required: true },
      { name: 'edge1', type: 'Edge', required: false },
      { name: 'edge2', type: 'Edge', required: false },
    ],
    outputs: [{ name: 'blendSurface', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Boundary',
    name: 'Boundary',
    description: 'Create surface from boundary curves',
    operation: 'BOUNDARY',
    occtBinding: 'boundary',
    parameters: [
      { name: 'type', type: 'enum', options: ['surface', 'solid'], default: 'surface' },
      {
        name: 'tangencyType',
        type: 'enum',
        options: ['none', 'tangent', 'curvature'],
        default: 'none',
      },
    ],
    inputs: [
      { name: 'curves', type: 'Wire[]', required: true },
      { name: 'tangentFaces', type: 'Face[]', required: false },
    ],
    outputs: [{ name: 'shape', type: 'Shape' }],
  },
];

/**
 * Shell and Thickness Operations
 */
export const shellThicknessTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Shell',
    name: 'Shell',
    description: 'Hollow out solid',
    operation: 'SHELL',
    occtBinding: 'shell',
    parameters: [
      {
        name: 'thickness',
        type: 'number',
        default: 2,
        min: 0.01,
        max: 1000,
        description: 'Wall thickness',
      },
      {
        name: 'direction',
        type: 'enum',
        options: ['inward', 'outward', 'both'],
        default: 'inward',
      },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
    ],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'facesToRemove', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'shell', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Shell',
    name: 'VariableShell',
    description: 'Shell with variable thickness',
    operation: 'VARIABLE_SHELL',
    occtBinding: 'variableShell',
    parameters: [],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'facesToRemove', type: 'Face[]', required: true },
      {
        name: 'thicknessMap',
        type: 'Data',
        required: true,
        description: 'Face to thickness mapping',
      },
    ],
    outputs: [{ name: 'shell', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Thickness',
    name: 'Thicken',
    description: 'Thicken surface to solid',
    operation: 'THICKEN',
    occtBinding: 'thicken',
    parameters: [
      { name: 'thickness', type: 'number', default: 5, min: 0.01, max: 1000 },
      {
        name: 'direction',
        type: 'enum',
        options: ['normal', 'reverse', 'both'],
        default: 'normal',
      },
      { name: 'autoClose', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'surface', type: 'Face', required: true }],
    outputs: [{ name: 'solid', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Thickness',
    name: 'OffsetSurface',
    description: 'Offset surface or solid',
    operation: 'OFFSET_SURFACE',
    occtBinding: 'offsetSurface',
    parameters: [
      { name: 'offset', type: 'number', default: 5, min: -1000, max: 1000 },
      { name: 'fillGaps', type: 'boolean', default: true },
      { name: 'extend', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'offsetShape', type: 'Shape' }],
  },
];

/**
 * Draft and Taper Operations
 */
export const draftTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Draft',
    name: 'Draft',
    description: 'Add draft angle to faces',
    operation: 'DRAFT',
    occtBinding: 'draft',
    parameters: [
      {
        name: 'angle',
        type: 'number',
        default: 3,
        min: -30,
        max: 30,
        description: 'Draft angle in degrees',
      },
      { name: 'pullDirection', type: 'vector3', default: [0, 0, 1] },
      { name: 'neutralPlane', type: 'vector3', default: [0, 0, 0] },
    ],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'facesToDraft', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'drafted', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Draft',
    name: 'PartingLineDraft',
    description: 'Draft from parting line',
    operation: 'PARTING_LINE_DRAFT',
    occtBinding: 'partingLineDraft',
    parameters: [
      { name: 'upperAngle', type: 'number', default: 3, min: 0, max: 30 },
      { name: 'lowerAngle', type: 'number', default: 3, min: 0, max: 30 },
      { name: 'pullDirection', type: 'vector3', default: [0, 0, 1] },
    ],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'partingEdges', type: 'Edge[]', required: true },
    ],
    outputs: [{ name: 'drafted', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Draft',
    name: 'StepDraft',
    description: 'Multi-step draft',
    operation: 'STEP_DRAFT',
    occtBinding: 'stepDraft',
    parameters: [{ name: 'steps', type: 'number', default: 2, min: 1, max: 10, step: 1 }],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'draftData', type: 'Data', required: true, description: 'Step heights and angles' },
    ],
    outputs: [{ name: 'drafted', type: 'Shape' }],
  },
];

/**
 * Surface Operations
 */
export const surfaceOperationTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Surface',
    name: 'TrimSurface',
    description: 'Trim surface with curves',
    operation: 'TRIM_SURFACE',
    occtBinding: 'trimSurface',
    parameters: [
      { name: 'keepRegion', type: 'enum', options: ['inside', 'outside'], default: 'inside' },
      { name: 'projectCurves', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'surface', type: 'Face', required: true },
      { name: 'trimmingCurves', type: 'Wire[]', required: true },
    ],
    outputs: [{ name: 'trimmedSurface', type: 'Face' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Surface',
    name: 'ExtendSurface',
    description: 'Extend surface edges',
    operation: 'EXTEND_SURFACE',
    occtBinding: 'extendSurface',
    parameters: [
      { name: 'extensionLength', type: 'number', default: 10, min: 0.1, max: 1000 },
      {
        name: 'extensionType',
        type: 'enum',
        options: ['linear', 'natural', 'reflective'],
        default: 'natural',
      },
    ],
    inputs: [
      { name: 'surface', type: 'Face', required: true },
      { name: 'edges', type: 'Edge[]', required: true },
    ],
    outputs: [{ name: 'extendedSurface', type: 'Face' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Surface',
    name: 'UntrimSurface',
    description: 'Remove trimming from surface',
    operation: 'UNTRIM_SURFACE',
    occtBinding: 'untrimSurface',
    parameters: [{ name: 'keepHoles', type: 'boolean', default: false }],
    inputs: [{ name: 'trimmedSurface', type: 'Face', required: true }],
    outputs: [{ name: 'untrimmedSurface', type: 'Face' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Surface',
    name: 'KnitSurfaces',
    description: 'Knit surfaces together',
    operation: 'KNIT_SURFACES',
    occtBinding: 'knitSurfaces',
    parameters: [
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'createSolid', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'surfaces', type: 'Face[]', required: true }],
    outputs: [{ name: 'knittedShape', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Surface',
    name: 'PatchSurface',
    description: 'Create patch surface',
    operation: 'PATCH_SURFACE',
    occtBinding: 'patchSurface',
    parameters: [
      { name: 'continuity', type: 'enum', options: ['G0', 'G1', 'G2'], default: 'G1' },
      {
        name: 'constraintType',
        type: 'enum',
        options: ['none', 'tangent', 'curvature'],
        default: 'tangent',
      },
    ],
    inputs: [
      { name: 'boundaryEdges', type: 'Edge[]', required: true },
      { name: 'guideWires', type: 'Wire[]', required: false },
    ],
    outputs: [{ name: 'patch', type: 'Face' }],
  },
];

/**
 * Advanced Features
 */
export const advancedFeatureTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Features',
    name: 'Wrap',
    description: 'Wrap geometry onto surface',
    operation: 'WRAP',
    occtBinding: 'wrap',
    parameters: [
      {
        name: 'wrapType',
        type: 'enum',
        options: ['scribe', 'emboss', 'deboss'],
        default: 'emboss',
      },
      { name: 'depth', type: 'number', default: 1, min: 0.01, max: 100 },
    ],
    inputs: [
      { name: 'targetSurface', type: 'Face', required: true },
      { name: 'sketch', type: 'Wire', required: true },
      { name: 'projectionDirection', type: 'Vector', required: false },
    ],
    outputs: [{ name: 'wrappedShape', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Features',
    name: 'Dome',
    description: 'Create dome on face',
    operation: 'DOME',
    occtBinding: 'dome',
    parameters: [
      { name: 'height', type: 'number', default: 10, min: 0.1, max: 1000 },
      {
        name: 'constraintType',
        type: 'enum',
        options: ['none', 'tangent', 'elliptical'],
        default: 'tangent',
      },
    ],
    inputs: [{ name: 'face', type: 'Face', required: true }],
    outputs: [{ name: 'dome', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Features',
    name: 'Flex',
    description: 'Flex solid for living hinges',
    operation: 'FLEX',
    occtBinding: 'flex',
    parameters: [
      { name: 'bendAngle', type: 'number', default: 90, min: 0, max: 180 },
      { name: 'bendRadius', type: 'number', default: 10, min: 0.1, max: 1000 },
      { name: 'accuracy', type: 'number', default: 1, min: 0.1, max: 10 },
    ],
    inputs: [
      { name: 'solid', type: 'Shape', required: true },
      { name: 'bendPlane', type: 'Plane', required: true },
      { name: 'trimPlanes', type: 'Plane[]', required: false },
    ],
    outputs: [{ name: 'flexed', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Features',
    name: 'Indent',
    description: 'Create indent from tool body',
    operation: 'INDENT',
    occtBinding: 'indent',
    parameters: [
      { name: 'offset', type: 'number', default: 0.5, min: 0, max: 100 },
      { name: 'flipDirection', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'targetBody', type: 'Shape', required: true },
      { name: 'toolBody', type: 'Shape', required: true },
    ],
    outputs: [{ name: 'indented', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Features',
    name: 'Deform',
    description: 'Point deformation',
    operation: 'DEFORM',
    occtBinding: 'deform',
    parameters: [
      {
        name: 'deformType',
        type: 'enum',
        options: ['point', 'curve', 'surface'],
        default: 'point',
      },
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 1000 },
      { name: 'stiffness', type: 'number', default: 0.5, min: 0, max: 1 },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'controlPoints', type: 'Point[]', required: true },
      { name: 'targetPoints', type: 'Point[]', required: true },
    ],
    outputs: [{ name: 'deformed', type: 'Shape' }],
  },
];

/**
 * Healing and Repair Operations
 */
export const healingTemplates: NodeTemplate[] = [
  {
    category: 'Advanced',
    subcategory: 'Healing',
    name: 'HealShape',
    description: 'Repair geometric errors',
    operation: 'HEAL_SHAPE',
    occtBinding: 'healShape',
    parameters: [
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'fixSmallEdges', type: 'boolean', default: true },
      { name: 'fixSmallFaces', type: 'boolean', default: true },
      { name: 'sewFaces', type: 'boolean', default: true },
      { name: 'makeManifold', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'healed', type: 'Shape' },
      { name: 'report', type: 'Data' },
    ],
  },

  {
    category: 'Advanced',
    subcategory: 'Healing',
    name: 'RemoveFeatures',
    description: 'Remove small features',
    operation: 'REMOVE_FEATURES',
    occtBinding: 'removeFeatures',
    parameters: [
      { name: 'minSize', type: 'number', default: 0.5, min: 0.01, max: 100 },
      { name: 'removeHoles', type: 'boolean', default: true },
      { name: 'removeFillets', type: 'boolean', default: false },
      { name: 'removeChamfers', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'simplified', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Healing',
    name: 'DeleteFace',
    description: 'Delete and heal faces',
    operation: 'DELETE_FACE',
    occtBinding: 'deleteFace',
    parameters: [
      { name: 'healingType', type: 'enum', options: ['cap', 'extend', 'none'], default: 'extend' },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'facesToDelete', type: 'Face[]', required: true },
    ],
    outputs: [{ name: 'result', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Healing',
    name: 'SimplifyShape',
    description: 'Simplify complex geometry',
    operation: 'SIMPLIFY_SHAPE',
    occtBinding: 'simplifyShape',
    parameters: [
      {
        name: 'simplifyMethod',
        type: 'enum',
        options: ['merge-faces', 'remove-details', 'defeaturing'],
        default: 'merge-faces',
      },
      { name: 'tolerance', type: 'number', default: 0.01, min: 0.0001, max: 1 },
      { name: 'preserveTopology', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'simplified', type: 'Shape' }],
  },

  {
    category: 'Advanced',
    subcategory: 'Healing',
    name: 'CheckGeometry',
    description: 'Validate geometry',
    operation: 'CHECK_GEOMETRY',
    occtBinding: 'checkGeometry',
    parameters: [
      {
        name: 'checkLevel',
        type: 'enum',
        options: ['basic', 'standard', 'advanced'],
        default: 'standard',
      },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'isValid', type: 'boolean' },
      { name: 'errors', type: 'Data' },
    ],
  },
];

// Export all templates
export const allAdvancedOperationTemplates = [
  ...sweepLoftTemplates,
  ...shellThicknessTemplates,
  ...draftTemplates,
  ...surfaceOperationTemplates,
  ...advancedFeatureTemplates,
  ...healingTemplates,
];
