/**
 * Manufacturing Feature Node Templates
 * High-value nodes for real-world CAD operations
 */

import { NodeTemplate } from '../node-template';

/**
 * Hole Wizard - Covers 90% of fastener needs
 */
export const holeTemplates: NodeTemplate[] = [
  {
    category: 'Features',
    subcategory: 'Holes',
    name: 'SimpleHole',
    description: 'Creates a simple through hole',
    tags: ['hole', 'drill', 'fastener'],

    operation: 'MAKE_HOLE',
    occtBinding: 'makeHole',

    parameters: [
      {
        name: 'diameter',
        type: 'number',
        default: 10,
        min: 0.1,
        max: 1000,
        step: 0.1,
        description: 'Hole diameter in mm',
      },
      {
        name: 'depth',
        type: 'number',
        default: -1,
        min: -1,
        description: 'Hole depth (-1 for through hole)',
      },
    ],

    inputs: [
      {
        name: 'solid',
        type: 'Shape',
        required: true,
        description: 'Solid to create hole in',
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
        description: 'Hole center position',
      },
      {
        name: 'direction',
        type: 'Vector',
        required: false,
        description: 'Hole direction (default: -Z)',
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
        description: 'Solid with hole',
      },
    ],

    examples: [
      {
        title: 'M6 Clearance Hole',
        parameters: { diameter: 6.5, depth: -1 },
      },
      {
        title: 'M10 Tapped Hole',
        parameters: { diameter: 8.5, depth: 20 },
      },
    ],
  },

  {
    category: 'Features',
    subcategory: 'Holes',
    name: 'CounterboreHole',
    description: 'Creates a counterbore hole for socket head cap screws',
    tags: ['hole', 'counterbore', 'fastener', 'SHCS'],

    operation: 'MAKE_COUNTERBORE',
    occtBinding: 'makeCounterbore',

    parameters: [
      {
        name: 'holeDiameter',
        type: 'number',
        default: 6.5,
        min: 0.1,
        max: 100,
        description: 'Through hole diameter',
      },
      {
        name: 'counterbore',
        type: 'number',
        default: 11,
        min: 0.1,
        max: 200,
        description: 'Counterbore diameter',
      },
      {
        name: 'cbDepth',
        type: 'number',
        default: 6,
        min: 0.1,
        max: 100,
        description: 'Counterbore depth',
      },
      {
        name: 'holeDepth',
        type: 'number',
        default: -1,
        min: -1,
        description: 'Total hole depth (-1 for through)',
      },
    ],

    inputs: [
      {
        name: 'solid',
        type: 'Shape',
        required: true,
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],

    examples: [
      {
        title: 'M6 SHCS',
        parameters: { holeDiameter: 6.5, counterbore: 11, cbDepth: 6 },
      },
      {
        title: 'M10 SHCS',
        parameters: { holeDiameter: 11, counterbore: 18, cbDepth: 10 },
      },
    ],
  },

  {
    category: 'Features',
    subcategory: 'Holes',
    name: 'CountersinkHole',
    description: 'Creates a countersink hole for flat head screws',
    tags: ['hole', 'countersink', 'fastener', 'FHS'],

    operation: 'MAKE_COUNTERSINK',
    occtBinding: 'makeCountersink',

    parameters: [
      {
        name: 'holeDiameter',
        type: 'number',
        default: 6.5,
        min: 0.1,
        max: 100,
      },
      {
        name: 'countersinkDiameter',
        type: 'number',
        default: 12,
        min: 0.1,
        max: 200,
      },
      {
        name: 'angle',
        type: 'enum',
        default: '90',
        options: ['82', '90', '100', '120'],
        description: 'Countersink angle in degrees',
      },
      {
        name: 'depth',
        type: 'number',
        default: -1,
        min: -1,
      },
    ],

    inputs: [
      {
        name: 'solid',
        type: 'Shape',
        required: true,
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },

  {
    category: 'Features',
    subcategory: 'Holes',
    name: 'ThreadedHole',
    description: 'Creates a threaded (tapped) hole',
    tags: ['hole', 'thread', 'tap', 'fastener'],

    operation: 'MAKE_THREADED_HOLE',

    parameters: [
      {
        name: 'threadSize',
        type: 'enum',
        default: 'M6',
        options: ['M3', 'M4', 'M5', 'M6', 'M8', 'M10', 'M12', 'M16', 'M20'],
        description: 'Thread size',
      },
      {
        name: 'pitch',
        type: 'number',
        default: 1.0,
        min: 0.25,
        max: 3,
        step: 0.25,
        description: 'Thread pitch',
      },
      {
        name: 'depth',
        type: 'number',
        default: 20,
        min: 1,
        max: 1000,
      },
      {
        name: 'threadClass',
        type: 'enum',
        default: '6H',
        options: ['6H', '6g', '7H'],
        description: 'Thread tolerance class',
      },
    ],

    inputs: [
      {
        name: 'solid',
        type: 'Shape',
        required: true,
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },
];

/**
 * Pocket Features - Essential for machining
 */
export const pocketTemplates: NodeTemplate[] = [
  {
    category: 'Features',
    subcategory: 'Pockets',
    name: 'RectangularPocket',
    description: 'Creates a rectangular pocket with optional corner radius',
    tags: ['pocket', 'cavity', 'milling'],

    operation: 'MAKE_POCKET_RECT',

    parameters: [
      {
        name: 'width',
        type: 'number',
        default: 50,
        min: 0.1,
        max: 10000,
      },
      {
        name: 'height',
        type: 'number',
        default: 30,
        min: 0.1,
        max: 10000,
      },
      {
        name: 'depth',
        type: 'number',
        default: 10,
        min: 0.1,
        max: 1000,
      },
      {
        name: 'cornerRadius',
        type: 'number',
        default: 0,
        min: 0,
        max: 100,
        description: 'Corner radius (0 for sharp corners)',
      },
      {
        name: 'draftAngle',
        type: 'number',
        default: 0,
        min: 0,
        max: 45,
        description: 'Draft angle for molding',
      },
    ],

    inputs: [
      {
        name: 'face',
        type: 'Face',
        required: true,
        description: 'Face to create pocket on',
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
        description: 'Pocket center position',
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },

  {
    category: 'Features',
    subcategory: 'Pockets',
    name: 'CircularPocket',
    description: 'Creates a circular pocket',
    tags: ['pocket', 'cavity', 'milling'],

    operation: 'MAKE_POCKET_CIRC',

    parameters: [
      {
        name: 'diameter',
        type: 'number',
        default: 40,
        min: 0.1,
        max: 10000,
      },
      {
        name: 'depth',
        type: 'number',
        default: 10,
        min: 0.1,
        max: 1000,
      },
      {
        name: 'draftAngle',
        type: 'number',
        default: 0,
        min: 0,
        max: 45,
      },
    ],

    inputs: [
      {
        name: 'face',
        type: 'Face',
        required: true,
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },
];

/**
 * Pattern Generators - Multiply productivity
 */
export const patternTemplates: NodeTemplate[] = [
  {
    category: 'Transform',
    subcategory: 'Patterns',
    name: 'LinearPattern',
    description: 'Creates a linear array of features or shapes',
    tags: ['pattern', 'array', 'duplicate', 'linear'],

    operation: 'PATTERN_LINEAR',

    parameters: [
      {
        name: 'count',
        type: 'number',
        default: 5,
        min: 2,
        max: 1000,
        step: 1,
        description: 'Number of instances',
      },
      {
        name: 'spacing',
        type: 'number',
        default: 20,
        min: 0.1,
        max: 10000,
        description: 'Distance between instances',
      },
      {
        name: 'direction',
        type: 'vector3',
        default: [1, 0, 0],
        description: 'Pattern direction vector',
      },
      {
        name: 'centered',
        type: 'boolean',
        default: false,
        description: 'Center pattern around origin',
      },
    ],

    inputs: [
      {
        name: 'shape',
        type: 'Shape',
        required: true,
        description: 'Shape or feature to pattern',
      },
    ],

    outputs: [
      {
        name: 'shapes',
        type: 'Shape[]',
        description: 'Array of patterned shapes',
      },
      {
        name: 'compound',
        type: 'Shape',
        description: 'Compound shape of all instances',
      },
    ],

    examples: [
      {
        title: 'Hole Pattern',
        parameters: { count: 10, spacing: 15, direction: [1, 0, 0] },
      },
      {
        title: 'Centered Array',
        parameters: { count: 7, spacing: 25, centered: true },
      },
    ],
  },

  {
    category: 'Transform',
    subcategory: 'Patterns',
    name: 'CircularPattern',
    description: 'Creates a circular array of features or shapes',
    tags: ['pattern', 'array', 'duplicate', 'circular', 'polar'],

    operation: 'PATTERN_CIRCULAR',

    parameters: [
      {
        name: 'count',
        type: 'number',
        default: 6,
        min: 2,
        max: 1000,
        step: 1,
      },
      {
        name: 'angle',
        type: 'number',
        default: 360,
        min: 0,
        max: 360,
        description: 'Total angle to fill (degrees)',
      },
      {
        name: 'center',
        type: 'vector3',
        default: [0, 0, 0],
        description: 'Pattern center point',
      },
      {
        name: 'axis',
        type: 'vector3',
        default: [0, 0, 1],
        description: 'Rotation axis',
      },
      {
        name: 'rotateInstances',
        type: 'boolean',
        default: true,
        description: 'Rotate instances to follow pattern',
      },
    ],

    inputs: [
      {
        name: 'shape',
        type: 'Shape',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shapes',
        type: 'Shape[]',
      },
      {
        name: 'compound',
        type: 'Shape',
      },
    ],

    examples: [
      {
        title: 'Bolt Circle',
        parameters: { count: 8, angle: 360, rotateInstances: false },
      },
      {
        title: 'Turbine Blades',
        parameters: { count: 24, angle: 360, rotateInstances: true },
      },
    ],
  },

  {
    category: 'Transform',
    subcategory: 'Patterns',
    name: 'RectangularPattern',
    description: 'Creates a 2D rectangular grid pattern',
    tags: ['pattern', 'array', 'grid', 'rectangular'],

    operation: 'PATTERN_RECTANGULAR',

    parameters: [
      {
        name: 'countX',
        type: 'number',
        default: 4,
        min: 1,
        max: 100,
      },
      {
        name: 'countY',
        type: 'number',
        default: 3,
        min: 1,
        max: 100,
      },
      {
        name: 'spacingX',
        type: 'number',
        default: 20,
        min: 0.1,
        max: 10000,
      },
      {
        name: 'spacingY',
        type: 'number',
        default: 20,
        min: 0.1,
        max: 10000,
      },
      {
        name: 'staggered',
        type: 'boolean',
        default: false,
        description: 'Stagger alternate rows',
      },
    ],

    inputs: [
      {
        name: 'shape',
        type: 'Shape',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shapes',
        type: 'Shape[]',
      },
      {
        name: 'compound',
        type: 'Shape',
      },
    ],
  },
];

/**
 * Ribs and Bosses - Structural features
 */
export const ribBossTemplates: NodeTemplate[] = [
  {
    category: 'Features',
    subcategory: 'Structural',
    name: 'LinearRib',
    description: 'Creates a reinforcing rib along a path',
    tags: ['rib', 'reinforcement', 'structural'],

    operation: 'MAKE_RIB',

    parameters: [
      {
        name: 'thickness',
        type: 'number',
        default: 3,
        min: 0.1,
        max: 100,
      },
      {
        name: 'height',
        type: 'number',
        default: 20,
        min: 0.1,
        max: 1000,
      },
      {
        name: 'draftAngle',
        type: 'number',
        default: 1,
        min: 0,
        max: 10,
        description: 'Draft angle for molding',
      },
      {
        name: 'topRadius',
        type: 'number',
        default: 1,
        min: 0,
        max: 50,
        description: 'Top edge fillet radius',
      },
    ],

    inputs: [
      {
        name: 'face',
        type: 'Face',
        required: true,
        description: 'Base face for rib',
      },
      {
        name: 'path',
        type: 'Curve',
        required: true,
        description: 'Path for rib',
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },

  {
    category: 'Features',
    subcategory: 'Structural',
    name: 'MountingBoss',
    description: 'Creates a mounting boss for screws',
    tags: ['boss', 'mounting', 'fastener'],

    operation: 'MAKE_BOSS',

    parameters: [
      {
        name: 'outerDiameter',
        type: 'number',
        default: 12,
        min: 1,
        max: 200,
      },
      {
        name: 'innerDiameter',
        type: 'number',
        default: 5,
        min: 0.1,
        max: 190,
        description: 'Pilot hole diameter',
      },
      {
        name: 'height',
        type: 'number',
        default: 10,
        min: 0.1,
        max: 1000,
      },
      {
        name: 'draftAngle',
        type: 'number',
        default: 1,
        min: 0,
        max: 10,
      },
    ],

    inputs: [
      {
        name: 'face',
        type: 'Face',
        required: true,
      },
      {
        name: 'position',
        type: 'Point',
        required: true,
      },
    ],

    outputs: [
      {
        name: 'shape',
        type: 'Shape',
      },
    ],
  },
];

// Export all templates
export const manufacturingTemplates = [
  ...holeTemplates,
  ...pocketTemplates,
  ...patternTemplates,
  ...ribBossTemplates,
];
