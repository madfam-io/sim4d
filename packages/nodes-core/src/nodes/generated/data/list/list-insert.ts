import type { NodeDefinition } from '@sim4d/types';

type ListInsertParams = Record<string, never>;

interface ListInsertInputs {
  list: unknown;
  item: unknown;
  index: unknown;
}

interface ListInsertOutputs {
  result: unknown;
}

export const DataListListInsertNode: NodeDefinition<
  ListInsertInputs,
  ListInsertOutputs,
  ListInsertParams
> = {
  id: 'Data::ListInsert',
  type: 'Data::ListInsert',
  category: 'Data',
  label: 'ListInsert',
  description: 'Insert item in list',
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
      type: 'listInsert',
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
