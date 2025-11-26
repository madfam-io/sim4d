import type { NodeDefinition } from '@sim4d/types';

type ListReplaceParams = Record<string, never>;

interface ListReplaceInputs {
  list: unknown;
  item: unknown;
  index: unknown;
}

interface ListReplaceOutputs {
  result: unknown;
}

export const DataListListReplaceNode: NodeDefinition<
  ListReplaceInputs,
  ListReplaceOutputs,
  ListReplaceParams
> = {
  id: 'Data::ListReplace',
  type: 'Data::ListReplace',
  category: 'Data',
  label: 'ListReplace',
  description: 'Replace item in list',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    item: {
      type: 'Data',
      label: 'Item',
      required: true,
    },
    index: {
      type: 'number',
      label: 'Index',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Data[]',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listReplace',
      params: {
        list: inputs.list,
        item: inputs.item,
        index: inputs.index,
      },
    });

    return {
      result: result,
    };
  },
};
