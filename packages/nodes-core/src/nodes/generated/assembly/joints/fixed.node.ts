import type { NodeDefinition } from '@brepflow/types';

type FixedParams = Record<string, never>;

interface FixedInputs {
  part1: unknown;
  part2: unknown;
}

interface FixedOutputs {
  joint: unknown;
}

export const AssemblyJointsFixedNode: NodeDefinition<FixedInputs, FixedOutputs, FixedParams> = {
  id: 'Assembly::Fixed',
  category: 'Assembly',
  label: 'Fixed',
  description: 'Create fixed joint',
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
      type: 'jointFixed',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
      },
    });

    return {
      joint: result,
    };
  },
};
