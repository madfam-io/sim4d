/**
 * Advanced Primitive Templates
 * Extended geometric primitives beyond basic shapes
 */

import { NodeTemplate } from '../node-template';

export const advancedPrimitiveTemplates: NodeTemplate[] = [
  // Parametric Solids
  {
    category: 'Solid',
    subcategory: 'Parametric',
    name: 'Prism',
    description: 'Create a prism from a profile and height',
    operation: 'MAKE_PRISM',
    occtBinding: 'makePrism',
    parameters: [
      {
        name: 'height',
        type: 'number',
        default: 100,
        min: 0.1,
        max: 10000,
        description: 'Prism height',
      },
      {
        name: 'twist',
        type: 'number',
        default: 0,
        min: -360,
        max: 360,
        description: 'Twist angle in degrees',
      },
      { name: 'taper', type: 'number', default: 1, min: 0.1, max: 10, description: 'Taper ratio' },
    ],
    inputs: [{ name: 'profile', type: 'Wire', required: true, description: 'Base profile' }],
    outputs: [{ name: 'solid', type: 'Solid', description: 'Generated prism' }],
  },

  {
    category: 'Solid',
    subcategory: 'Parametric',
    name: 'Wedge',
    description: 'Create a wedge solid',
    operation: 'MAKE_WEDGE',
    occtBinding: 'makeWedge',
    parameters: [
      { name: 'dx', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'dy', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'dz', type: 'number', default: 75, min: 0.1, max: 10000 },
      { name: 'xmax', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'zmin', type: 'number', default: 25, min: 0.1, max: 10000 },
      { name: 'zmax', type: 'number', default: 50, min: 0.1, max: 10000 },
    ],
    inputs: [],
    outputs: [{ name: 'solid', type: 'Solid', description: 'Generated wedge' }],
  },

  {
    category: 'Solid',
    subcategory: 'Parametric',
    name: 'Pyramid',
    description: 'Create a pyramid or truncated pyramid',
    operation: 'MAKE_PYRAMID',
    occtBinding: 'makePyramid',
    parameters: [
      { name: 'baseWidth', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'baseDepth', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'height', type: 'number', default: 100, min: 0.1, max: 10000 },
      {
        name: 'topWidth',
        type: 'number',
        default: 0,
        min: 0,
        max: 10000,
        description: '0 for pointed pyramid',
      },
      { name: 'topDepth', type: 'number', default: 0, min: 0, max: 10000 },
    ],
    inputs: [],
    outputs: [{ name: 'solid', type: 'Solid', description: 'Generated pyramid' }],
  },

  // Surface Primitives
  {
    category: 'Solid',
    subcategory: 'Surface',
    name: 'BezierSurface',
    description: 'Create a Bezier surface from control points',
    operation: 'MAKE_BEZIER_SURFACE',
    occtBinding: 'makeBezierSurface',
    parameters: [
      { name: 'uDegree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'vDegree', type: 'number', default: 3, min: 1, max: 10 },
    ],
    inputs: [
      {
        name: 'controlPoints',
        type: 'Point[][]',
        required: true,
        description: 'Grid of control points',
      },
    ],
    outputs: [{ name: 'surface', type: 'Face', description: 'Bezier surface' }],
  },

  {
    category: 'Solid',
    subcategory: 'Surface',
    name: 'BSplineSurface',
    description: 'Create a B-Spline surface',
    operation: 'MAKE_BSPLINE_SURFACE',
    occtBinding: 'makeBSplineSurface',
    parameters: [
      { name: 'uDegree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'vDegree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'uPeriodic', type: 'boolean', default: false },
      { name: 'vPeriodic', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'controlPoints', type: 'Point[][]', required: true },
      { name: 'uKnots', type: 'number[]', required: false },
      { name: 'vKnots', type: 'number[]', required: false },
    ],
    outputs: [{ name: 'surface', type: 'Face', description: 'B-Spline surface' }],
  },

  {
    category: 'Solid',
    subcategory: 'Surface',
    name: 'RuledSurface',
    description: 'Create a ruled surface between two curves',
    operation: 'MAKE_RULED_SURFACE',
    occtBinding: 'makeRuledSurface',
    parameters: [],
    inputs: [
      { name: 'curve1', type: 'Wire', required: true, description: 'First curve' },
      { name: 'curve2', type: 'Wire', required: true, description: 'Second curve' },
    ],
    outputs: [{ name: 'surface', type: 'Face', description: 'Ruled surface' }],
  },

  // Helical Shapes
  {
    category: 'Solid',
    subcategory: 'Helical',
    name: 'Helix',
    description: 'Create a helical curve',
    operation: 'MAKE_HELIX',
    occtBinding: 'makeHelix',
    parameters: [
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'pitch', type: 'number', default: 20, min: 0.1, max: 10000 },
      { name: 'height', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'leftHanded', type: 'boolean', default: false },
    ],
    inputs: [],
    outputs: [{ name: 'helix', type: 'Wire', description: 'Helical curve' }],
  },

  {
    category: 'Solid',
    subcategory: 'Helical',
    name: 'Spring',
    description: 'Create a spring solid',
    operation: 'MAKE_SPRING',
    occtBinding: 'makeSpring',
    parameters: [
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'pitch', type: 'number', default: 20, min: 0.1, max: 10000 },
      { name: 'height', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'wireRadius', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'leftHanded', type: 'boolean', default: false },
    ],
    inputs: [],
    outputs: [{ name: 'spring', type: 'Solid', description: 'Spring solid' }],
  },

  {
    category: 'Solid',
    subcategory: 'Helical',
    name: 'Thread',
    description: 'Create threaded geometry',
    operation: 'MAKE_THREAD',
    occtBinding: 'makeThread',
    parameters: [
      { name: 'majorRadius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'pitch', type: 'number', default: 5, min: 0.1, max: 100 },
      { name: 'height', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'threadAngle', type: 'number', default: 60, min: 30, max: 90 },
      { name: 'internal', type: 'boolean', default: false },
    ],
    inputs: [],
    outputs: [{ name: 'thread', type: 'Solid', description: 'Threaded geometry' }],
  },
];

export const sketchPrimitiveTemplates: NodeTemplate[] = [
  // 2D Parametric Curves
  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Ellipse',
    description: 'Create an ellipse',
    operation: 'MAKE_ELLIPSE',
    occtBinding: 'makeEllipse',
    parameters: [
      { name: 'majorRadius', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'minorRadius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'startAngle', type: 'number', default: 0, min: 0, max: 360 },
      { name: 'endAngle', type: 'number', default: 360, min: 0, max: 360 },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'curve', type: 'Wire', description: 'Ellipse curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Parabola',
    description: 'Create a parabolic curve',
    operation: 'MAKE_PARABOLA',
    occtBinding: 'makeParabola',
    parameters: [
      { name: 'focalLength', type: 'number', default: 10, min: 0.1, max: 10000 },
      { name: 'startParam', type: 'number', default: -100, min: -10000, max: 10000 },
      { name: 'endParam', type: 'number', default: 100, min: -10000, max: 10000 },
    ],
    inputs: [{ name: 'vertex', type: 'Point', required: false }],
    outputs: [{ name: 'curve', type: 'Wire', description: 'Parabolic curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Hyperbola',
    description: 'Create a hyperbolic curve',
    operation: 'MAKE_HYPERBOLA',
    occtBinding: 'makeHyperbola',
    parameters: [
      { name: 'majorRadius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'minorRadius', type: 'number', default: 30, min: 0.1, max: 10000 },
      { name: 'startParam', type: 'number', default: -2, min: -10, max: 10 },
      { name: 'endParam', type: 'number', default: 2, min: -10, max: 10 },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'curve', type: 'Wire', description: 'Hyperbolic curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Spiral',
    description: 'Create a 2D spiral',
    operation: 'MAKE_SPIRAL_2D',
    occtBinding: 'makeSpiral2D',
    parameters: [
      { name: 'startRadius', type: 'number', default: 10, min: 0, max: 10000 },
      { name: 'endRadius', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'turns', type: 'number', default: 3, min: 0.1, max: 100 },
      {
        name: 'type',
        type: 'enum',
        options: ['archimedean', 'logarithmic'],
        default: 'archimedean',
      },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'spiral', type: 'Wire', description: '2D spiral curve' }],
  },

  // 2D Patterns
  {
    category: 'Sketch',
    subcategory: 'Patterns',
    name: 'Polygon',
    description: 'Create a regular polygon',
    operation: 'MAKE_POLYGON',
    occtBinding: 'makePolygon',
    parameters: [
      { name: 'sides', type: 'number', default: 6, min: 3, max: 100, step: 1 },
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      {
        name: 'inscribed',
        type: 'boolean',
        default: true,
        description: 'Inscribed vs circumscribed',
      },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'polygon', type: 'Wire', description: 'Regular polygon' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Patterns',
    name: 'Star',
    description: 'Create a star shape',
    operation: 'MAKE_STAR',
    occtBinding: 'makeStar',
    parameters: [
      { name: 'points', type: 'number', default: 5, min: 3, max: 100, step: 1 },
      { name: 'outerRadius', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'innerRadius', type: 'number', default: 40, min: 0.1, max: 10000 },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'star', type: 'Wire', description: 'Star shape' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Patterns',
    name: 'Gear',
    description: 'Create a gear profile',
    operation: 'MAKE_GEAR',
    occtBinding: 'makeGear',
    parameters: [
      { name: 'teeth', type: 'number', default: 20, min: 3, max: 200, step: 1 },
      { name: 'module', type: 'number', default: 2, min: 0.1, max: 100 },
      { name: 'pressureAngle', type: 'number', default: 20, min: 14.5, max: 30 },
      { name: 'addendum', type: 'number', default: 1, min: 0.5, max: 1.5 },
      { name: 'dedendum', type: 'number', default: 1.25, min: 1, max: 2 },
    ],
    inputs: [{ name: 'center', type: 'Point', required: false }],
    outputs: [{ name: 'gear', type: 'Wire', description: 'Gear profile' }],
  },
];

// Export all templates
export const allPrimitiveTemplates = [...advancedPrimitiveTemplates, ...sketchPrimitiveTemplates];
