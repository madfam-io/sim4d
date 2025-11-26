import type { NodeDefinition } from '@sim4d/types';

type ListAppendParams = Record<string, never>;

interface ListAppendInputs {
  list: unknown;
  item: unknown;
}

interface ListAppendOutputs {
  result: unknown;
}

export const DataListListAppendNode: NodeDefinition<
  ListAppendInputs,
  ListAppendOutputs,
  ListAppendParams
> = {
  id: 'Data::ListAppend',
  type: 'Data::ListAppend',
  category: 'Data',
  label: 'ListAppend',
  description: 'Append to list',
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
      type: 'listAppend',
      params: {
        list: inputs.list,
        item: inputs.item,
      },
    });

    return {
      result: result,
    };
  },
};
