import type { NodeDefinition, ShapeHandle, Vec3 } from '@sim4d/types';

export const ExtrudeNode: NodeDefinition<
  { profile: ShapeHandle; direction?: Vec3 },
  { shape: ShapeHandle },
  { distance: number; draft?: number }
> = {
  id: 'Solid::Extrude',
  category: 'Solid',
  label: 'Extrude',
  description: 'Extrude a profile to create a solid',
  inputs: {
    profile: { type: 'Shape' },
    direction: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 25,
      min: 0.001,
    },
    draft: {
      type: 'number',
      label: 'Draft Angle',
      default: 0,
      min: -45,
      max: 45,
    },
  },
  async evaluate(ctx, inputs, params) {
    const direction = inputs.direction || { x: 0, y: 0, z: 1 };

    const result = await ctx.worker.invoke('MAKE_EXTRUDE', {
      profile: inputs.profile,
      direction,
      distance: params.distance,
      draft: params.draft,
    });
    return { shape: result };
  },
};

export const RevolveNode: NodeDefinition<
  { profile: ShapeHandle; axis?: ShapeHandle },
  { shape: ShapeHandle },
  { angle: number; origin?: Vec3; direction?: Vec3 }
> = {
  id: 'Solid::Revolve',
  category: 'Solid',
  label: 'Revolve',
  description: 'Revolve a profile around an axis',
  inputs: {
    profile: { type: 'Shape' },
    axis: { type: 'Curve', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 360,
      min: 0.1,
      max: 360,
    },
    origin: {
      type: 'vec3',
      label: 'Axis Origin',
      default: { x: 0, y: 0, z: 0 },
    },
    direction: {
      type: 'vec3',
      label: 'Axis Direction',
      default: { x: 0, y: 1, z: 0 },
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_REVOLVE', {
      profile: inputs.profile,
      axis: inputs.axis,
      angle: params.angle,
      origin: params.origin,
      direction: params.direction,
    });
    return { shape: result };
  },
};

export const SweepNode: NodeDefinition<
  { profile: ShapeHandle; path: ShapeHandle },
  { shape: ShapeHandle },
  { twist?: number; scale?: number }
> = {
  id: 'Solid::Sweep',
  category: 'Solid',
  label: 'Sweep',
  description: 'Sweep a profile along a path',
  inputs: {
    profile: { type: 'Shape' },
    path: { type: 'Curve' },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    twist: {
      type: 'number',
      label: 'Twist',
      default: 0,
      min: -360,
      max: 360,
    },
    scale: {
      type: 'number',
      label: 'End Scale',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('MAKE_SWEEP', {
      profile: inputs.profile,
      path: inputs.path,
      twist: params.twist,
      scale: params.scale,
    });
    return { shape: result };
  },
};

export const LoftNode: NodeDefinition<
  { profiles: ShapeHandle[] },
  { shape: ShapeHandle },
  { ruled?: boolean; closed?: boolean }
> = {
  id: 'Solid::Loft',
  category: 'Solid',
  label: 'Loft',
  description: 'Create a loft between multiple profiles',
  inputs: {
    profiles: { type: 'Shape', multiple: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    ruled: {
      type: 'boolean',
      label: 'Ruled',
      default: false,
    },
    closed: {
      type: 'boolean',
      label: 'Closed',
      default: false,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.profiles || inputs.profiles.length < 2) {
      throw new Error('Loft requires at least 2 profiles');
    }

    const result = await ctx.worker.invoke('MAKE_LOFT', {
      profiles: inputs.profiles,
      ruled: params.ruled,
      closed: params.closed,
    });
    return { shape: result };
  },
};

export const BoxNode: NodeDefinition<
  { center?: Vec3 },
  { shape: ShapeHandle },
  { width: number; height: number; depth: number }
> = {
  id: 'Solid::Box',
  category: 'Solid',
  label: 'Box',
  description: 'Create a box primitive',
  inputs: {
    center: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 100,
      min: 0.001,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 60,
      min: 0.001,
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 40,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || { x: 0, y: 0, z: 0 };

    const result = await ctx.worker.invoke('MAKE_BOX', {
      center,
      width: params.width,
      height: params.height,
      depth: params.depth,
    });
    return { shape: result };
  },
};

export const CylinderNode: NodeDefinition<
  { center?: Vec3; axis?: Vec3 },
  { shape: ShapeHandle },
  { radius: number; height: number }
> = {
  id: 'Solid::Cylinder',
  category: 'Solid',
  label: 'Cylinder',
  description: 'Create a cylinder primitive',
  inputs: {
    center: { type: 'Vector', optional: true },
    axis: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 30,
      min: 0.001,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 60,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || { x: 0, y: 0, z: 0 };
    const axis = inputs.axis || { x: 0, y: 0, z: 1 };

    const result = await ctx.worker.invoke('MAKE_CYLINDER', {
      center,
      axis,
      radius: params.radius,
      height: params.height,
    });
    return { shape: result };
  },
};

export const SphereNode: NodeDefinition<
  { center?: Vec3 },
  { shape: ShapeHandle },
  { radius: number }
> = {
  id: 'Solid::Sphere',
  category: 'Solid',
  label: 'Sphere',
  description: 'Create a sphere primitive',
  inputs: {
    center: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 30,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || { x: 0, y: 0, z: 0 };

    const result = await ctx.worker.invoke('MAKE_SPHERE', {
      center,
      radius: params.radius,
    });
    return { shape: result };
  },
};

export const ConeNode: NodeDefinition<
  { center?: Vec3; axis?: Vec3 },
  { shape: ShapeHandle },
  { baseRadius: number; topRadius: number; height: number }
> = {
  id: 'Solid::Cone',
  category: 'Solid',
  label: 'Cone',
  description: 'Create a cone primitive',
  inputs: {
    center: { type: 'Vector', optional: true },
    axis: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    baseRadius: {
      type: 'number',
      label: 'Base Radius',
      default: 30,
      min: 0.001,
    },
    topRadius: {
      type: 'number',
      label: 'Top Radius',
      default: 0,
      min: 0,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 60,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || { x: 0, y: 0, z: 0 };
    const axis = inputs.axis || { x: 0, y: 0, z: 1 };

    const result = await ctx.worker.invoke('MAKE_CONE', {
      center,
      axis,
      baseRadius: params.baseRadius,
      topRadius: params.topRadius,
      height: params.height,
    });
    return { shape: result };
  },
};

export const TorusNode: NodeDefinition<
  { center?: Vec3; axis?: Vec3 },
  { shape: ShapeHandle },
  { majorRadius: number; minorRadius: number }
> = {
  id: 'Solid::Torus',
  category: 'Solid',
  label: 'Torus',
  description: 'Create a torus primitive',
  inputs: {
    center: { type: 'Vector', optional: true },
    axis: { type: 'Vector', optional: true },
  },
  outputs: {
    shape: { type: 'Shape' },
  },
  params: {
    majorRadius: {
      type: 'number',
      label: 'Major Radius',
      default: 40,
      min: 0.001,
    },
    minorRadius: {
      type: 'number',
      label: 'Minor Radius',
      default: 15,
      min: 0.001,
    },
  },
  async evaluate(ctx, inputs, params) {
    const center = inputs.center || { x: 0, y: 0, z: 0 };
    const axis = inputs.axis || { x: 0, y: 0, z: 1 };

    const result = await ctx.worker.invoke('MAKE_TORUS', {
      center,
      axis,
      majorRadius: params.majorRadius,
      minorRadius: params.minorRadius,
    });
    return { shape: result };
  },
};

export const solidNodes = [
  ExtrudeNode,
  RevolveNode,
  SweepNode,
  LoftNode,
  BoxNode,
  CylinderNode,
  SphereNode,
  ConeNode,
  TorusNode,
];
