import type { NodeDefinition } from '@sim4d/types';

type UniversalParams = Record<string, never>;

interface UniversalInputs {
  part1: unknown;
  part2: unknown;
  center: [number, number, number];
}

interface UniversalOutputs {
  joint: unknown;
}

export const AssemblyJointsUniversalNode: NodeDefinition<
  UniversalInputs,
  UniversalOutputs,
  UniversalParams
> = {
  id: 'Assembly::Universal',
  category: 'Assembly',
  label: 'Universal',
  description: 'Create universal joint',
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
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointUniversal',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        center: inputs.center,
      },
    });

    return {
      joint: result,
    };
  },
};
