import type { NodeDefinition } from '@brepflow/types';

type ListContainsParams = Record<string, never>;

interface ListContainsInputs {
  list: unknown;
  item: unknown;
}

interface ListContainsOutputs {
  contains: unknown;
  index: unknown;
}

export const DataListListContainsNode: NodeDefinition<
  ListContainsInputs,
  ListContainsOutputs,
  ListContainsParams
> = {
  id: 'Data::ListContains',
  category: 'Data',
  label: 'ListContains',
  description: 'Check if list contains item',
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
    contains: {
      type: 'boolean',
      label: 'Contains',
    },
    index: {
      type: 'number',
      label: 'Index',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'listContains',
      params: {
        list: inputs.list,
        item: inputs.item,
      },
    });

    return {
      contains: results.contains,
      index: results.index,
    };
  },
};
