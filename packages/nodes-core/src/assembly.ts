import type { NodeDefinition, ShapeHandle, Vec3, AssemblyHandle } from '@sim4d/types';

export const AssemblyNode: NodeDefinition<
  { parts: ShapeHandle[] },
  { assembly: AssemblyHandle },
  { name: string; visible: boolean }
> = {
  id: 'Assembly::Assembly',
  category: 'Assembly',
  label: 'Assembly',
  description: 'Create an assembly from multiple parts',
  inputs: {
    parts: { type: 'Shape', multiple: true },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    name: {
      type: 'string',
      label: 'Assembly Name',
      default: 'Assembly1',
    },
    visible: {
      type: 'boolean',
      label: 'Visible',
      default: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    if (!inputs.parts || inputs.parts.length === 0) {
      throw new Error('Assembly requires at least one part');
    }

    const result = await ctx.worker.invoke('CREATE_ASSEMBLY', {
      parts: inputs.parts,
      name: params.name,
      visible: params.visible,
    });
    return { assembly: result };
  },
};

export const MateNode: NodeDefinition<
  { assembly: AssemblyHandle; part1: ShapeHandle; part2: ShapeHandle },
  { assembly: AssemblyHandle },
  { mateType: string; axis1?: Vec3; axis2?: Vec3; distance?: number; angle?: number }
> = {
  id: 'Assembly::Mate',
  category: 'Assembly',
  label: 'Mate',
  description: 'Create a mate constraint between two parts',
  inputs: {
    assembly: { type: 'Assembly' },
    part1: { type: 'Shape' },
    part2: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    mateType: {
      type: 'string',
      label: 'Mate Type',
      default: 'coincident',
      options: [
        'coincident',
        'concentric',
        'parallel',
        'perpendicular',
        'tangent',
        'distance',
        'angle',
      ],
    },
    axis1: {
      type: 'vec3',
      label: 'Part 1 Axis/Point',
      default: { x: 0, y: 0, z: 0 },
      optional: true,
    },
    axis2: {
      type: 'vec3',
      label: 'Part 2 Axis/Point',
      default: { x: 0, y: 0, z: 0 },
      optional: true,
    },
    distance: {
      type: 'number',
      label: 'Distance',
      default: 0,
      optional: true,
    },
    angle: {
      type: 'number',
      label: 'Angle (degrees)',
      default: 0,
      min: -180,
      max: 180,
      optional: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_MATE', {
      assembly: inputs.assembly,
      part1: inputs.part1,
      part2: inputs.part2,
      mateType: params.mateType,
      axis1: params.axis1,
      axis2: params.axis2,
      distance: params.distance,
      angle: params.angle,
    });
    return { assembly: result };
  },
};

export const PatternNode: NodeDefinition<
  { assembly: AssemblyHandle; part: ShapeHandle },
  { assembly: AssemblyHandle },
  { patternType: string; count: number; spacing?: number; axis?: Vec3; angle?: number }
> = {
  id: 'Assembly::Pattern',
  category: 'Assembly',
  label: 'Pattern',
  description: 'Create a pattern of parts in an assembly',
  inputs: {
    assembly: { type: 'Assembly' },
    part: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    patternType: {
      type: 'string',
      label: 'Pattern Type',
      default: 'linear',
      options: ['linear', 'circular', 'rectangular'],
    },
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
      optional: true,
    },
    axis: {
      type: 'vec3',
      label: 'Pattern Axis',
      default: { x: 1, y: 0, z: 0 },
      optional: true,
    },
    angle: {
      type: 'number',
      label: 'Angular Spacing (degrees)',
      default: 45,
      optional: true,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('CREATE_PATTERN', {
      assembly: inputs.assembly,
      part: inputs.part,
      patternType: params.patternType,
      count: params.count,
      spacing: params.spacing,
      axis: params.axis,
      angle: params.angle,
    });
    return { assembly: result };
  },
};

export const TransformNode: NodeDefinition<
  { assembly: AssemblyHandle; part: ShapeHandle },
  { assembly: AssemblyHandle },
  { translation: Vec3; rotation: Vec3; scale: number }
> = {
  id: 'Assembly::Transform',
  category: 'Assembly',
  label: 'Transform',
  description: 'Transform a part within an assembly',
  inputs: {
    assembly: { type: 'Assembly' },
    part: { type: 'Shape' },
  },
  outputs: {
    assembly: { type: 'Assembly' },
  },
  params: {
    translation: {
      type: 'vec3',
      label: 'Translation',
      default: { x: 0, y: 0, z: 0 },
    },
    rotation: {
      type: 'vec3',
      label: 'Rotation (degrees)',
      default: { x: 0, y: 0, z: 0 },
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1.0,
      min: 0.1,
      max: 10.0,
    },
  },
  async evaluate(ctx, inputs, params) {
    const result = await ctx.worker.invoke('TRANSFORM_PART', {
      assembly: inputs.assembly,
      part: inputs.part,
      translation: params.translation,
      rotation: params.rotation,
      scale: params.scale,
    });
    return { assembly: result };
  },
};

export const assemblyNodes = [AssemblyNode, MateNode, PatternNode, TransformNode];
