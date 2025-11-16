import type { NodeDefinition } from '@brepflow/types';

type ListPrependParams = Record<string, never>;

interface ListPrependInputs {
  list: unknown;
  item: unknown;
}

interface ListPrependOutputs {
  result: unknown;
}

export const DataListListPrependNode: NodeDefinition<
  ListPrependInputs,
  ListPrependOutputs,
  ListPrependParams
> = {
  id: 'Data::ListPrepend',
  type: 'Data::ListPrepend',
  category: 'Data',
  label: 'ListPrepend',
  description: 'Prepend to list',
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
      type: 'listPrepend',
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
