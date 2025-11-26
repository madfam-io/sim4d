import type { NodeDefinition } from '@sim4d/types';

interface ListShuffleParams {
  seed: number;
}

interface ListShuffleInputs {
  list: unknown;
}

interface ListShuffleOutputs {
  shuffled: unknown;
}

export const DataListListShuffleNode: NodeDefinition<
  ListShuffleInputs,
  ListShuffleOutputs,
  ListShuffleParams
> = {
  id: 'Data::ListShuffle',
  category: 'Data',
  label: 'ListShuffle',
  description: 'Randomize list order',
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
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listShuffle',
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
