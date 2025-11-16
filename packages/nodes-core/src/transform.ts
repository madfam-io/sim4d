import type { NodeDefinition, ShapeHandle, Vec3 } from '@brepflow/types';

export const MoveNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle },
  { offset: Vec3 }
> = {
  id: 'Transform::Move',
  category: 'Transform',
  label: 'Move',
  description: 'Move shape by offset',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    offset: {
      type: 'vec3',
      label: 'Offset',
      default: { x: 0, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('TRANSFORM_MOVE', {
      shape: inputs.shape,
      offset: params.offset,
    });
    return { shape: result };
  },
};

export const RotateNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle },
  { angle: number; axis: Vec3; origin?: Vec3 }
> = {
  id: 'Transform::Rotate',
  category: 'Transform',
  label: 'Rotate',
  description: 'Rotate shape around axis',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: -360,
      max: 360,
    },
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: { x: 0, y: 0, z: 1 },
    },
    origin: {
      type: 'vec3',
      label: 'Origin',
      default: { x: 0, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('TRANSFORM_ROTATE', {
      shape: inputs.shape,
      angle: params.angle,
      axis: params.axis,
      origin: params.origin,
    });
    return { shape: result };
  },
};

export const ScaleNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle },
  { scale: Vec3 | number; origin?: Vec3 }
> = {
  id: 'Transform::Scale',
  category: 'Transform',
  label: 'Scale',
  description: 'Scale shape',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1,
      min: 0.001,
      max: 100,
    },
    origin: {
      type: 'vec3',
      label: 'Origin',
      default: { x: 0, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('TRANSFORM_SCALE', {
      shape: inputs.shape,
      scale: params.scale,
      origin: params.origin,
    });
    return { shape: result };
  },
};

export const MirrorNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle },
  { plane: 'XY' | 'XZ' | 'YZ'; origin?: Vec3 }
> = {
  id: 'Transform::Mirror',
  category: 'Transform',
  label: 'Mirror',
  description: 'Mirror shape across plane',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    plane: {
      type: 'enum',
      label: 'Plane',
      default: 'XY',
      options: ['XY', 'XZ', 'YZ'],
    },
    origin: {
      type: 'vec3',
      label: 'Origin',
      default: { x: 0, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('TRANSFORM_MIRROR', {
      shape: inputs.shape,
      plane: params.plane,
      origin: params.origin,
    });
    return { shape: result };
  },
};

export const ArrayLinearNode: NodeDefinition<
  { shape: ShapeHandle },
  { shapes: ShapeHandle[] },
  { count: number; spacing: Vec3 }
> = {
  id: 'Transform::ArrayLinear',
  category: 'Transform',
  label: 'Linear Array',
  description: 'Create linear array of shapes',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shapes: { type: 'Shape', multiple: true },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 5,
      min: 1,
      max: 100,
    },
    spacing: {
      type: 'vec3',
      label: 'Spacing',
      default: { x: 50, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const shapes: ShapeHandle[] = [];

    for (let i = 0; i < params.count; i++) {
      const offset = {
        x: params.spacing.x * i,
        y: params.spacing.y * i,
        z: params.spacing.z * i,
      };

      const shape = await ctx.worker.invoke('TRANSFORM_MOVE', {
        shape: inputs.shape,
        offset,
      });
      shapes.push(shape);
    }

    return { shapes };
  },
};

export const ArrayCircularNode: NodeDefinition<
  { shape: ShapeHandle },
  { shapes: ShapeHandle[] },
  { count: number; angle: number; axis: Vec3; center?: Vec3 }
> = {
  id: 'Transform::ArrayCircular',
  category: 'Transform',
  label: 'Circular Array',
  description: 'Create circular array of shapes',
  inputs: {
    shape: { type: 'Shape' },
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
      label: 'Total Angle',
      default: 360,
      min: 0,
      max: 360,
    },
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: { x: 0, y: 0, z: 1 },
    },
    center: {
      type: 'vec3',
      label: 'Center',
      default: { x: 0, y: 0, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const shapes: ShapeHandle[] = [];
    const angleStep = params.angle / params.count;

    for (let i = 0; i < params.count; i++) {
      const shape = await ctx.worker.invoke('TRANSFORM_ROTATE', {
        shape: inputs.shape,
        angle: angleStep * i,
        axis: params.axis,
        origin: params.center,
      });
      shapes.push(shape);
    }

    return { shapes };
  },
};

export const transformNodes = [
  MoveNode,
  RotateNode,
  ScaleNode,
  MirrorNode,
  ArrayLinearNode,
  ArrayCircularNode,
];
