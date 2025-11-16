/**
 * Transform Operations Templates - Phase 2
 * Spatial transformations and array operations
 */

import { NodeTemplate } from '../node-template';

/**
 * Transform Operations - Move, rotate, scale, mirror, and array
 */
export const transformOperationTemplates: NodeTemplate[] = [
  {
    category: 'Transform',
    name: 'Move',
    description: 'Translate shape in 3D space',
    operation: 'TRANSFORM_MOVE',
    occtBinding: 'transformMove',
    parameters: [
      {
        name: 'x',
        type: 'number',
        default: 0,
        min: -10000,
        max: 10000,
        description: 'X translation',
      },
      {
        name: 'y',
        type: 'number',
        default: 0,
        min: -10000,
        max: 10000,
        description: 'Y translation',
      },
      {
        name: 'z',
        type: 'number',
        default: 0,
        min: -10000,
        max: 10000,
        description: 'Z translation',
      },
      { name: 'copy', type: 'boolean', default: true, description: 'Create copy or move original' },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true, description: 'Shape to move' }],
    outputs: [{ name: 'moved', type: 'Shape', description: 'Moved shape' }],
  },

  {
    category: 'Transform',
    name: 'Rotate',
    description: 'Rotate shape around axis',
    operation: 'TRANSFORM_ROTATE',
    occtBinding: 'transformRotate',
    parameters: [
      {
        name: 'angle',
        type: 'number',
        default: 45,
        min: -360,
        max: 360,
        description: 'Rotation angle in degrees',
      },
      {
        name: 'axisX',
        type: 'number',
        default: 0,
        min: -1,
        max: 1,
        description: 'Axis X component',
      },
      {
        name: 'axisY',
        type: 'number',
        default: 0,
        min: -1,
        max: 1,
        description: 'Axis Y component',
      },
      {
        name: 'axisZ',
        type: 'number',
        default: 1,
        min: -1,
        max: 1,
        description: 'Axis Z component',
      },
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'copy', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'rotated', type: 'Shape', description: 'Rotated shape' }],
  },

  {
    category: 'Transform',
    name: 'Scale',
    description: 'Scale shape uniformly or non-uniformly',
    operation: 'TRANSFORM_SCALE',
    occtBinding: 'transformScale',
    parameters: [
      {
        name: 'scaleX',
        type: 'number',
        default: 1,
        min: 0.001,
        max: 1000,
        description: 'X scale factor',
      },
      {
        name: 'scaleY',
        type: 'number',
        default: 1,
        min: 0.001,
        max: 1000,
        description: 'Y scale factor',
      },
      {
        name: 'scaleZ',
        type: 'number',
        default: 1,
        min: 0.001,
        max: 1000,
        description: 'Z scale factor',
      },
      { name: 'uniform', type: 'boolean', default: true, description: 'Use uniform scaling' },
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'copy', type: 'boolean', default: true },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'scaled', type: 'Shape', description: 'Scaled shape' }],
  },

  {
    category: 'Transform',
    name: 'Mirror',
    description: 'Mirror shape across a plane',
    operation: 'TRANSFORM_MIRROR',
    occtBinding: 'transformMirror',
    parameters: [
      { name: 'planeOriginX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'planeOriginY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'planeOriginZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'planeNormalX', type: 'number', default: 1, min: -1, max: 1 },
      { name: 'planeNormalY', type: 'number', default: 0, min: -1, max: 1 },
      { name: 'planeNormalZ', type: 'number', default: 0, min: -1, max: 1 },
      { name: 'copy', type: 'boolean', default: true, description: 'Keep original' },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'mirrored', type: 'Shape', description: 'Mirrored shape' }],
  },

  {
    category: 'Transform',
    name: 'LinearArray',
    description: 'Create linear array of shapes',
    operation: 'TRANSFORM_LINEAR_ARRAY',
    occtBinding: 'transformLinearArray',
    parameters: [
      { name: 'count', type: 'number', default: 5, min: 2, max: 1000, step: 1 },
      { name: 'spacingX', type: 'number', default: 100, min: -10000, max: 10000 },
      { name: 'spacingY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'spacingZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'merge', type: 'boolean', default: false, description: 'Merge into single shape' },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'array', type: 'Shape[]', description: 'Array of shapes' },
      { name: 'merged', type: 'Shape', description: 'Merged result (if merge=true)' },
    ],
  },

  {
    category: 'Transform',
    name: 'PolarArray',
    description: 'Create circular/polar array',
    operation: 'TRANSFORM_POLAR_ARRAY',
    occtBinding: 'transformPolarArray',
    parameters: [
      { name: 'count', type: 'number', default: 8, min: 2, max: 1000, step: 1 },
      { name: 'totalAngle', type: 'number', default: 360, min: 0, max: 360 },
      { name: 'centerX', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerY', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'centerZ', type: 'number', default: 0, min: -10000, max: 10000 },
      { name: 'axisX', type: 'number', default: 0, min: -1, max: 1 },
      { name: 'axisY', type: 'number', default: 0, min: -1, max: 1 },
      { name: 'axisZ', type: 'number', default: 1, min: -1, max: 1 },
      { name: 'rotateItems', type: 'boolean', default: true },
      { name: 'merge', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'array', type: 'Shape[]' },
      { name: 'merged', type: 'Shape' },
    ],
  },

  {
    category: 'Transform',
    name: 'PathArray',
    description: 'Array shapes along a path',
    operation: 'TRANSFORM_PATH_ARRAY',
    occtBinding: 'transformPathArray',
    parameters: [
      { name: 'count', type: 'number', default: 10, min: 2, max: 1000, step: 1 },
      { name: 'alignToPath', type: 'boolean', default: true },
      { name: 'spacing', type: 'enum', options: ['equal', 'distance'], default: 'equal' },
      { name: 'distance', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'merge', type: 'boolean', default: false },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'path', type: 'Wire', required: true, description: 'Path curve' },
    ],
    outputs: [
      { name: 'array', type: 'Shape[]' },
      { name: 'merged', type: 'Shape' },
    ],
  },

  {
    category: 'Transform',
    name: 'GridArray',
    description: 'Create 2D or 3D grid array',
    operation: 'TRANSFORM_GRID_ARRAY',
    occtBinding: 'transformGridArray',
    parameters: [
      { name: 'countX', type: 'number', default: 3, min: 1, max: 100, step: 1 },
      { name: 'countY', type: 'number', default: 3, min: 1, max: 100, step: 1 },
      { name: 'countZ', type: 'number', default: 1, min: 1, max: 100, step: 1 },
      { name: 'spacingX', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'spacingY', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'spacingZ', type: 'number', default: 100, min: 0.1, max: 10000 },
      { name: 'merge', type: 'boolean', default: false },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'array', type: 'Shape[]' },
      { name: 'merged', type: 'Shape' },
    ],
  },

  {
    category: 'Transform',
    name: 'Align',
    description: 'Align shapes to each other',
    operation: 'TRANSFORM_ALIGN',
    occtBinding: 'transformAlign',
    parameters: [
      {
        name: 'alignX',
        type: 'enum',
        options: ['none', 'min', 'center', 'max'],
        default: 'center',
      },
      {
        name: 'alignY',
        type: 'enum',
        options: ['none', 'min', 'center', 'max'],
        default: 'center',
      },
      { name: 'alignZ', type: 'enum', options: ['none', 'min', 'center', 'max'], default: 'none' },
    ],
    inputs: [
      { name: 'shapes', type: 'Shape[]', required: true, description: 'Shapes to align' },
      { name: 'reference', type: 'Shape', required: false, description: 'Reference shape' },
    ],
    outputs: [{ name: 'aligned', type: 'Shape[]', description: 'Aligned shapes' }],
  },

  {
    category: 'Transform',
    name: 'Orient',
    description: 'Orient shape to match reference orientation',
    operation: 'TRANSFORM_ORIENT',
    occtBinding: 'transformOrient',
    parameters: [],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'fromDirection', type: 'Vector', required: true },
      { name: 'toDirection', type: 'Vector', required: true },
    ],
    outputs: [{ name: 'oriented', type: 'Shape' }],
  },

  {
    category: 'Transform',
    name: 'ProjectToPlane',
    description: 'Project shape onto a plane',
    operation: 'TRANSFORM_PROJECT',
    occtBinding: 'transformProject',
    parameters: [
      { name: 'planeOriginX', type: 'number', default: 0 },
      { name: 'planeOriginY', type: 'number', default: 0 },
      { name: 'planeOriginZ', type: 'number', default: 0 },
      { name: 'planeNormalX', type: 'number', default: 0 },
      { name: 'planeNormalY', type: 'number', default: 0 },
      { name: 'planeNormalZ', type: 'number', default: 1 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'projected', type: 'Shape' }],
  },

  {
    category: 'Transform',
    name: 'Wrap',
    description: 'Wrap shape around cylinder or sphere',
    operation: 'TRANSFORM_WRAP',
    occtBinding: 'transformWrap',
    parameters: [
      { name: 'type', type: 'enum', options: ['cylinder', 'sphere'], default: 'cylinder' },
      { name: 'radius', type: 'number', default: 50, min: 0.1, max: 10000 },
      { name: 'angle', type: 'number', default: 360, min: 0, max: 360 },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [{ name: 'wrapped', type: 'Shape' }],
  },

  {
    category: 'Transform',
    name: 'Deform',
    description: 'Deform shape with control points',
    operation: 'TRANSFORM_DEFORM',
    occtBinding: 'transformDeform',
    parameters: [
      {
        name: 'method',
        type: 'enum',
        options: ['bend', 'twist', 'taper', 'stretch'],
        default: 'bend',
      },
      { name: 'amount', type: 'number', default: 1, min: -10, max: 10 },
    ],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      { name: 'controlPoints', type: 'Point[]', required: false },
    ],
    outputs: [{ name: 'deformed', type: 'Shape' }],
  },

  {
    category: 'Transform',
    name: 'BoundingBoxAlign',
    description: 'Align shape to its bounding box',
    operation: 'TRANSFORM_BBOX_ALIGN',
    occtBinding: 'transformBBoxAlign',
    parameters: [
      { name: 'alignToOrigin', type: 'boolean', default: true },
      { name: 'alignCorner', type: 'enum', options: ['min', 'center', 'max'], default: 'min' },
    ],
    inputs: [{ name: 'shape', type: 'Shape', required: true }],
    outputs: [
      { name: 'aligned', type: 'Shape' },
      { name: 'boundingBox', type: 'Shape', description: 'Bounding box as geometry' },
    ],
  },

  {
    category: 'Transform',
    name: 'MatrixTransform',
    description: 'Apply transformation matrix',
    operation: 'TRANSFORM_MATRIX',
    occtBinding: 'transformMatrix',
    parameters: [],
    inputs: [
      { name: 'shape', type: 'Shape', required: true },
      {
        name: 'matrix',
        type: 'Matrix4x4',
        required: true,
        description: '4x4 transformation matrix',
      },
    ],
    outputs: [{ name: 'transformed', type: 'Shape' }],
  },
];

// Export all templates
export const allTransformTemplates = [...transformOperationTemplates];
