import type { NodeDefinition } from '@sim4d/types';

type ListReverseParams = Record<string, never>;

interface ListReverseInputs {
  list: unknown;
}

interface ListReverseOutputs {
  reversed: unknown;
}

export const DataListListReverseNode: NodeDefinition<
  ListReverseInputs,
  ListReverseOutputs,
  ListReverseParams
> = {
  id: 'Data::ListReverse',
  category: 'Data',
  label: 'ListReverse',
  description: 'Reverse list order',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    reversed: {
      type: 'Data[]',
      label: 'Reversed',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listReverse',
      params: {
        list: inputs.list,
      },
    });

    return {
      reversed: result,
    };
  },
};
