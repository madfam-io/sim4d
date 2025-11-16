import type { NodeDefinition, ShapeHandle, Vec3 } from '@brepflow/types';

const extractPatternShapes = (result: any): ShapeHandle[] => {
  if (Array.isArray(result)) return result;
  if (result?.shapes && Array.isArray(result.shapes)) return result.shapes;
  return [];
};

export const LinearPatternNode: NodeDefinition<
  { shape: ShapeHandle; direction?: Vec3 },
  { shapes: ShapeHandle[] },
  { count: number; spacing: number; direction: Vec3; keepOriginal: boolean; centered: boolean }
> = {
  id: 'Pattern::Linear',
  category: 'Pattern',
  label: 'Linear Pattern',
  description: 'Create a linear pattern of shapes',
  inputs: {
    shape: { type: 'Shape' },
    direction: { type: 'Vector', optional: true },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 3,
      min: 2,
      max: 100,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 50,
      min: 0.1,
    },
    direction: {
      type: 'vec3',
      label: 'Direction',
      default: { x: 1, y: 0, z: 0 },
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
    centered: {
      type: 'boolean',
      label: 'Centered',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const direction = inputs.direction || params.direction;

    const result = await ctx.worker.invoke('CREATE_LINEAR_PATTERN', {
      shape: inputs.shape,
      count: params.count,
      spacing: params.spacing,
      direction,
      centered: params.centered,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const CircularPatternNode: NodeDefinition<
  { shape: ShapeHandle; axis?: Vec3; center?: Vec3 },
  { shapes: ShapeHandle[] },
  {
    count: number;
    angle: number;
    center: Vec3;
    axis: Vec3;
    keepOriginal: boolean;
    rotateInstances: boolean;
  }
> = {
  id: 'Pattern::Circular',
  category: 'Pattern',
  label: 'Circular Pattern',
  description: 'Create a circular pattern of shapes',
  inputs: {
    shape: { type: 'Shape' },
    axis: { type: 'Vector', optional: true },
    center: { type: 'Vector', optional: true },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 6,
      min: 2,
      max: 100,
    },
    angle: {
      type: 'number',
      label: 'Total Angle (degrees)',
      default: 360,
      min: 1,
      max: 360,
    },
    center: {
      type: 'vec3',
      label: 'Center Point',
      default: { x: 0, y: 0, z: 0 },
    },
    axis: {
      type: 'vec3',
      label: 'Rotation Axis',
      default: { x: 0, y: 0, z: 1 },
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
    rotateInstances: {
      type: 'boolean',
      label: 'Rotate Instances',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;
    const axis = inputs.axis || params.axis;

    const result = await ctx.worker.invoke('CREATE_CIRCULAR_PATTERN', {
      shape: inputs.shape,
      count: params.count,
      angle: params.angle,
      center,
      axis,
      rotateInstances: params.rotateInstances,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const RectangularPatternNode: NodeDefinition<
  { shape: ShapeHandle; direction1?: Vec3; direction2?: Vec3 },
  { shapes: ShapeHandle[] },
  {
    count1: number;
    count2: number;
    spacing1: number;
    spacing2: number;
    direction1: Vec3;
    direction2: Vec3;
    keepOriginal: boolean;
  }
> = {
  id: 'Pattern::Rectangular',
  category: 'Pattern',
  label: 'Rectangular Pattern',
  description: 'Create a rectangular grid pattern of shapes',
  inputs: {
    shape: { type: 'Shape' },
    direction1: { type: 'Vector', optional: true },
    direction2: { type: 'Vector', optional: true },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    count1: {
      type: 'number',
      label: 'Count X',
      default: 3,
      min: 1,
      max: 50,
    },
    count2: {
      type: 'number',
      label: 'Count Y',
      default: 3,
      min: 1,
      max: 50,
    },
    spacing1: {
      type: 'number',
      label: 'Spacing X',
      default: 50,
      min: 0.1,
    },
    spacing2: {
      type: 'number',
      label: 'Spacing Y',
      default: 50,
      min: 0.1,
    },
    direction1: {
      type: 'vec3',
      label: 'Direction X',
      default: { x: 1, y: 0, z: 0 },
    },
    direction2: {
      type: 'vec3',
      label: 'Direction Y',
      default: { x: 0, y: 1, z: 0 },
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const direction1 = inputs.direction1 || params.direction1;
    const direction2 = inputs.direction2 || params.direction2;

    const result = await ctx.worker.invoke('CREATE_RECTANGULAR_PATTERN', {
      shape: inputs.shape,
      count1: params.count1,
      count2: params.count2,
      spacing1: params.spacing1,
      spacing2: params.spacing2,
      direction1,
      direction2,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const PathPatternNode: NodeDefinition<
  { shape: ShapeHandle; path: ShapeHandle },
  { shapes: ShapeHandle[] },
  { count: number; align: boolean; spacing: string; keepOriginal: boolean }
> = {
  id: 'Pattern::Path',
  category: 'Pattern',
  label: 'Path Pattern',
  description: 'Create a pattern along a path',
  inputs: {
    shape: { type: 'Shape' },
    path: { type: 'Curve' },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 5,
      min: 2,
      max: 100,
    },
    align: {
      type: 'boolean',
      label: 'Align to Path',
      default: true,
    },
    spacing: {
      type: 'string',
      label: 'Spacing Type',
      default: 'equal',
      options: ['equal', 'distance'],
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_PATH_PATTERN', {
      shape: inputs.shape,
      path: inputs.path,
      count: params.count,
      align: params.align,
      spacing: params.spacing,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const MirrorPatternNode: NodeDefinition<
  { shape: ShapeHandle; plane?: ShapeHandle },
  { shapes: ShapeHandle[] },
  { plane: Vec3; point: Vec3; keepOriginal: boolean }
> = {
  id: 'Pattern::Mirror',
  category: 'Pattern',
  label: 'Mirror Pattern',
  description: 'Create a mirrored pattern',
  inputs: {
    shape: { type: 'Shape' },
    plane: { type: 'Plane', optional: true },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    plane: {
      type: 'vec3',
      label: 'Mirror Plane Normal',
      default: { x: 1, y: 0, z: 0 },
    },
    point: {
      type: 'vec3',
      label: 'Point on Plane',
      default: { x: 0, y: 0, z: 0 },
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_MIRROR_PATTERN', {
      shape: inputs.shape,
      plane: inputs.plane,
      planeNormal: params.plane,
      planePoint: params.point,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const VariablePatternNode: NodeDefinition<
  { shape: ShapeHandle },
  { shapes: ShapeHandle[] },
  { transforms: any[]; keepOriginal: boolean }
> = {
  id: 'Pattern::Variable',
  category: 'Pattern',
  label: 'Variable Pattern',
  description: 'Create a pattern with custom transforms',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    transforms: {
      type: 'array',
      label: 'Transforms',
      default: [
        { translation: { x: 50, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: 1.0 },
        { translation: { x: 100, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 15 }, scale: 1.1 },
        { translation: { x: 150, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 30 }, scale: 1.2 },
      ],
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_VARIABLE_PATTERN', {
      shape: inputs.shape,
      transforms: params.transforms,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const HexPatternNode: NodeDefinition<
  { shape: ShapeHandle; center?: Vec3 },
  { shapes: ShapeHandle[] },
  { rings: number; spacing: number; center: Vec3; keepOriginal: boolean }
> = {
  id: 'Pattern::Hexagonal',
  category: 'Pattern',
  label: 'Hexagonal Pattern',
  description: 'Create a hexagonal grid pattern',
  inputs: {
    shape: { type: 'Shape' },
    center: { type: 'Vector', optional: true },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    rings: {
      type: 'number',
      label: 'Rings',
      default: 2,
      min: 1,
      max: 20,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 50,
      min: 0.1,
    },
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
    keepOriginal: {
      type: 'boolean',
      label: 'Keep Original',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || params.center;

    const result = await ctx.worker.invoke('CREATE_HEX_PATTERN', {
      shape: inputs.shape,
      rings: params.rings,
      spacing: params.spacing,
      center,
      keepOriginal: params.keepOriginal,
    });
    return { shapes: extractPatternShapes(result) };
  },
};

export const patternNodes = [
  LinearPatternNode,
  CircularPatternNode,
  RectangularPatternNode,
  PathPatternNode,
  MirrorPatternNode,
  VariablePatternNode,
  HexPatternNode,
];
