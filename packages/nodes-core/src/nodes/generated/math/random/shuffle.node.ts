import type { NodeDefinition } from '@sim4d/types';

interface ShuffleParams {
  seed: number;
}

interface ShuffleInputs {
  list: unknown;
}

interface ShuffleOutputs {
  shuffled: unknown;
}

export const MathRandomShuffleNode: NodeDefinition<ShuffleInputs, ShuffleOutputs, ShuffleParams> = {
  id: 'Math::Shuffle',
  category: 'Math',
  label: 'Shuffle',
  description: 'Shuffle list randomly',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    shuffled: {
      type: 'Data[]',
      label: 'Shuffled',
    },
  },
  params: {
    seed: {
      type: 'number',
      label: 'Seed',
      default: -1,
      min: -1,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathShuffle',
      params: {
        list: inputs.list,
        seed: params.seed,
      },
    });

    return {
      shuffled: result,
    };
  },
};
