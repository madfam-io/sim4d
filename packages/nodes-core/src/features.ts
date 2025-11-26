import type { NodeDefinition, ShapeHandle, Vec3 } from '@sim4d/types';

export const FilletNode: NodeDefinition<
  { shape: ShapeHandle; edges?: ShapeHandle[] },
  { shape: ShapeHandle },
  { radius: number; selectAll?: boolean }
> = {
  id: 'Features::Fillet',
  category: 'Features',
  label: 'Fillet',
  description: 'Apply fillet to edges',
  inputs: {
    shape: { type: 'Shape' },
    edges: { type: 'Curve', multiple: true, optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 5,
      min: 0.001,
    },
    selectAll: {
      type: 'boolean',
      label: 'All Edges',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_FILLET', {
      shape: inputs.shape,
      edges: inputs.edges,
      radius: params.radius,
      selectAll: params.selectAll,
    });
    return { shape: result };
  },
};

export const ChamferNode: NodeDefinition<
  { shape: ShapeHandle; edges?: ShapeHandle[] },
  { shape: ShapeHandle },
  { distance: number; selectAll?: boolean }
> = {
  id: 'Features::Chamfer',
  category: 'Features',
  label: 'Chamfer',
  description: 'Apply chamfer to edges',
  inputs: {
    shape: { type: 'Shape' },
    edges: { type: 'Curve', multiple: true, optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 3,
      min: 0.001,
    },
    selectAll: {
      type: 'boolean',
      label: 'All Edges',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_CHAMFER', {
      shape: inputs.shape,
      edges: inputs.edges,
      distance: params.distance,
      selectAll: params.selectAll,
    });
    return { shape: result };
  },
};

export const ShellNode: NodeDefinition<
  { shape: ShapeHandle; faces?: ShapeHandle[] },
  { shape: ShapeHandle },
  { thickness: number; inside?: boolean }
> = {
  id: 'Features::Shell',
  category: 'Features',
  label: 'Shell',
  description: 'Create a hollow shell',
  inputs: {
    shape: { type: 'Shape' },
    faces: { type: 'Surface', multiple: true, optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 2,
      min: 0.001,
    },
    inside: {
      type: 'boolean',
      label: 'Inside',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_SHELL', {
      shape: inputs.shape,
      faces: inputs.faces,
      thickness: params.thickness,
      inside: params.inside,
    });
    return { shape: result };
  },
};

export const DraftNode: NodeDefinition<
  { shape: ShapeHandle; neutralPlane?: ShapeHandle },
  { shape: ShapeHandle },
  { angle: number; pullDirection?: Vec3 }
> = {
  id: 'Features::Draft',
  category: 'Features',
  label: 'Draft',
  description: 'Apply draft angle to faces',
  inputs: {
    shape: { type: 'Shape' },
    neutralPlane: { type: 'Surface', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 3,
      min: 0,
      max: 45,
    },
    pullDirection: {
      type: 'vec3',
      label: 'Pull Direction',
      default: { x: 0, y: 0, z: 1 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_DRAFT', {
      shape: inputs.shape,
      neutralPlane: inputs.neutralPlane,
      angle: params.angle,
      pullDirection: params.pullDirection,
    });
    return { shape: result };
  },
};

export const OffsetNode: NodeDefinition<
  { shape: ShapeHandle },
  { shape: ShapeHandle },
  { distance: number; join?: 'arc' | 'intersection' }
> = {
  id: 'Features::Offset',
  category: 'Features',
  label: 'Offset',
  description: 'Create offset shape',
  inputs: {
    shape: { type: 'Shape' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 2,
      min: -100,
      max: 100,
    },
    join: {
      type: 'select',
      label: 'Join Type',
      default: 'arc',
      options: [
        { value: 'arc', label: 'Arc' },
        { value: 'intersection', label: 'Intersection' },
      ],
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_OFFSET', {
      shape: inputs.shape,
      distance: params.distance,
      join: params.join,
    });
    return { shape: result };
  },
};

export const featureNodes = [FilletNode, ChamferNode, ShellNode, DraftNode, OffsetNode];
