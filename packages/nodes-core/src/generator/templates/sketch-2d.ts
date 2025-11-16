/**
 * 2D Sketch Templates - Phase 2
 * Core 2D shapes and curves for sketching
 */

import { NodeTemplate } from '../node-template';

/**
 * Basic 2D Shapes - Foundation for sketches and profiles
 */
export const sketch2DTemplates: NodeTemplate[] = [
  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Line',
    description: 'Create a line segment',
    operation: 'MAKE_LINE',
    occtBinding: 'makeLine',
    parameters: [
      { name: 'startX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'startY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'startZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'endX', type: 'number', default: 100, min: -10000, max: 10000 },
      { name: 'endY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'endZ', type: 'number', default: 0, min: -10000, max: 10000 },
    ],
    inputs: [],
    outputs: [{ name: 'edge', type: 'Edge', description: 'Line segment' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Arc',
    description: 'Create a circular arc',
    operation: 'MAKE_ARC',
    occtBinding: 'makeArc',
    parameters: [
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      {
        name: 'startAngle',
        type: 'number',
        default: 0,
        min: 0,
        max: 360,
        description: 'Start angle in degrees',
      },
      {
        name: 'endAngle',
        type: 'number',
        default: 90,
        min: 0,
        max: 360,
        description: 'End angle in degrees',
      },
    ],
    inputs: [],
    outputs: [{ name: 'edge', type: 'Edge', description: 'Arc segment' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Circle',
    description: 'Create a circle',
    operation: 'MAKE_CIRCLE',
    occtBinding: 'makeCircle',
    parameters: [
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      {
        name: 'filled',
        type: 'boolean',
        default: true,
        description: 'Create as face (filled) or wire (outline)',
      },
    ],
    inputs: [],
    outputs: [{ name: 'shape', type: 'Shape', description: 'Circle face or wire' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Rectangle',
    description: 'Create a rectangle',
    operation: 'MAKE_RECTANGLE',
    occtBinding: 'makeRectangle',
    parameters: [
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'width', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'height', type: 'number', default: 50, min: 0.1, max: 10000 },
      {
        name: 'filled',
        type: 'boolean',
        default: true,
        description: 'Create as face (filled) or wire (outline)',
      },
      {
        name: 'cornerRadius',
        type: 'number',
        default: 0,
        min: 0,
        max: 1000,
        description: 'Corner rounding radius',
      },
    ],
    inputs: [],
    outputs: [{ name: 'shape', type: 'Shape', description: 'Rectangle face or wire' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Polyline',
    description: 'Create a polyline from points',
    operation: 'MAKE_POLYLINE',
    occtBinding: 'makePolyline',
    parameters: [
      { name: 'closed', type: 'boolean', default: false, description: 'Close the polyline' },
    ],
    inputs: [{ name: 'points', type: 'Point[]', required: true, description: 'Array of points' }],
    outputs: [{ name: 'wire', type: 'Wire', description: 'Polyline wire' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Spline',
    description: 'Create a spline curve through points',
    operation: 'MAKE_SPLINE',
    occtBinding: 'makeSpline',
    parameters: [
      { name: 'degree', type: 'number', default: 3, min: 1, max: 10, description: 'Spline degree' },
      { name: 'closed', type: 'boolean', default: false, description: 'Close the spline' },
      { name: 'smooth', type: 'boolean', default: true, description: 'Smooth tangents' },
    ],
    inputs: [
      { name: 'points', type: 'Point[]', required: true, description: 'Control points' },
      {
        name: 'tangents',
        type: 'Vector[]',
        required: false,
        description: 'Optional tangent vectors',
      },
    ],
    outputs: [{ name: 'curve', type: 'Wire', description: 'Spline curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'BezierCurve',
    description: 'Create a Bezier curve',
    operation: 'MAKE_BEZIER',
    occtBinding: 'makeBezier',
    parameters: [],
    inputs: [
      {
        name: 'controlPoints',
        type: 'Point[]',
        required: true,
        description: 'Bezier control points',
      },
    ],
    outputs: [{ name: 'curve', type: 'Wire', description: 'Bezier curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'BSplineCurve',
    description: 'Create a B-Spline curve',
    operation: 'MAKE_BSPLINE',
    occtBinding: 'makeBSpline',
    parameters: [
      { name: 'degree', type: 'number', default: 3, min: 1, max: 10 },
      { name: 'periodic', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'controlPoints', type: 'Point[]', required: true },
      { name: 'knots', type: 'number[]', required: false, description: 'Knot vector' },
      { name: 'weights', type: 'number[]', required: false, description: 'Control point weights' },
    ],
    outputs: [{ name: 'curve', type: 'Wire', description: 'B-Spline curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Point',
    description: 'Create a point',
    operation: 'MAKE_POINT',
    occtBinding: 'makePoint',
    parameters: [
      { name: 'x', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'y', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'z', type: 'number', default: 0, min: -10000, max: 10000 },
    ],
    inputs: [],
    outputs: [{ name: 'point', type: 'Point', description: 'Point vertex' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Slot',
    description: 'Create a slot (rounded rectangle)',
    operation: 'MAKE_SLOT',
    occtBinding: 'makeSlot',
    parameters: [
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'length', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'width', type: 'number', default: 20, min: 0.1, max: 10000 },
      {
        name: 'angle',
        type: 'number',
        default: 0,
        min: -180,
        max: 180,
        description: 'Rotation angle',
      },
    ],
    inputs: [],
    outputs: [{ name: 'face', type: 'Face', description: 'Slot face' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Basic',
    name: 'Text',
    description: 'Create text as geometry',
    operation: 'MAKE_TEXT',
    occtBinding: 'makeText',
    parameters: [
      { name: 'text', type: 'string', default: 'Text', description: 'Text content' },
      { name: 'font', type: 'string', default: 'Arial', description: 'Font family' },
      { name: 'size', type: 'number', default: 20, min: 1, max: 1000, description: 'Font size' },
      { name: 'bold', type: 'boolean', default: false },
      { name: 'italic', type: 'boolean', default: false },
      { name: 'x', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'y', type: 'number', default: 0, min: -10000, max: 10000 },
    ],
    inputs: [],
    outputs: [{ name: 'shape', type: 'Shape', description: 'Text as geometry' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Offset',
    description: 'Offset a curve',
    operation: 'OFFSET_CURVE',
    occtBinding: 'offsetCurve',
    parameters: [
      { name: 'distance', type: 'number', default: 10, min: -10000, max: 10000 },
      { name: 'side', type: 'enum', options: ['left', 'right', 'both'], default: 'right' },
    ],
    inputs: [{ name: 'curve', type: 'Wire', required: true, description: 'Curve to offset' }],
    outputs: [{ name: 'offset', type: 'Wire', description: 'Offset curve' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Fillet2D',
    description: 'Fillet corners of a 2D shape',
    operation: 'FILLET_2D',
    occtBinding: 'fillet2D',
    parameters: [
      { name: 'radius', type: 'number', default: 5, min: 0.1, max: 1000 },
      { name: 'allCorners', type: 'boolean', default: true },
    ],
    inputs: [
      { name: 'wire', type: 'Wire', required: true, description: 'Wire to fillet' },
      {
        name: 'vertices',
        type: 'Vertex[]',
        required: false,
        description: 'Specific vertices to fillet',
      },
    ],
    outputs: [{ name: 'filleted', type: 'Wire', description: 'Filleted wire' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Chamfer2D',
    description: 'Chamfer corners of a 2D shape',
    operation: 'CHAMFER_2D',
    occtBinding: 'chamfer2D',
    parameters: [{ name: 'distance', type: 'number', default: 5, min: 0.1, max: 1000 }],
    inputs: [
      { name: 'wire', type: 'Wire', required: true },
      { name: 'vertices', type: 'Vertex[]', required: false },
    ],
    outputs: [{ name: 'chamfered', type: 'Wire', description: 'Chamfered wire' }],
  },

  {
    category: 'Sketch',
    subcategory: 'Curves',
    name: 'Trim',
    description: 'Trim a curve',
    operation: 'TRIM_CURVE',
    occtBinding: 'trimCurve',
    parameters: [
      { name: 'startParameter', type: 'number', default: 0, min: 0, max: 1 },
      { name: 'endParameter', type: 'number', default: 1, min: 0, max: 1 },
    ],
    inputs: [{ name: 'curve', type: 'Wire', required: true }],
    outputs: [{ name: 'trimmed', type: 'Wire', description: 'Trimmed curve' }],
  },
];

// Export all templates
export const allSketch2DTemplates = [...sketch2DTemplates];
