import type { NodeDefinition } from '@brepflow/types';

interface RevoluteParams {
  minAngle: number;
  maxAngle: number;
}

interface RevoluteInputs {
  part1: unknown;
  part2: unknown;
  axis: unknown;
}

interface RevoluteOutputs {
  joint: unknown;
}

export const AssemblyJointsRevoluteNode: NodeDefinition<
  RevoluteInputs,
  RevoluteOutputs,
  RevoluteParams
> = {
  id: 'Assembly::Revolute',
  type: 'Assembly::Revolute',
  category: 'Assembly',
  label: 'Revolute',
  description: 'Create revolute (hinge) joint',
  inputs: {
    part1: {
      type: 'Shape',
      label: 'Part1',
      required: true,
    },
    part2: {
      type: 'Shape',
      label: 'Part2',
      required: true,
    },
    axis: {
      type: 'Axis',
      label: 'Axis',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {
    minAngle: {
      type: 'number',
      label: 'Min Angle',
      default: -180,
      min: -360,
      max: 360,
    },
    maxAngle: {
      type: 'number',
      label: 'Max Angle',
      default: 180,
      min: -360,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointRevolute',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        axis: inputs.axis,
        minAngle: params.minAngle,
        maxAngle: params.maxAngle,
      },
    });

    return {
      joint: result,
    };
  },
};
