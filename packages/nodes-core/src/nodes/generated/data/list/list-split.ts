import type { NodeDefinition } from '@brepflow/types';

type ListSplitParams = Record<string, never>;

interface ListSplitInputs {
  list: unknown;
  index: unknown;
}

interface ListSplitOutputs {
  before: unknown;
  after: unknown;
}

export const DataListListSplitNode: NodeDefinition<
  ListSplitInputs,
  ListSplitOutputs,
  ListSplitParams
> = {
  id: 'Data::ListSplit',
  type: 'Data::ListSplit',
  category: 'Data',
  label: 'ListSplit',
  description: 'Split list',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    index: {
      type: 'number',
      label: 'Index',
      required: true,
    },
  },
  outputs: {
    before: {
      type: 'Data[]',
      label: 'Before',
    },
    after: {
      type: 'Data[]',
      label: 'After',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'listSplit',
      params: {
        list: inputs.list,
        index: inputs.index,
      },
    });

    return {
      before: results.before,
      after: results.after,
    };
  },
};
