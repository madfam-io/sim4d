import type { NodeDefinition } from '@brepflow/types';

type ListFilterParams = Record<string, never>;

interface ListFilterInputs {
  list: unknown;
  mask: unknown;
}

interface ListFilterOutputs {
  filtered: unknown;
}

export const DataListListFilterNode: NodeDefinition<
  ListFilterInputs,
  ListFilterOutputs,
  ListFilterParams
> = {
  id: 'Data::ListFilter',
  type: 'Data::ListFilter',
  category: 'Data',
  label: 'ListFilter',
  description: 'Filter list by condition',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
    mask: {
      type: 'boolean[]',
      label: 'Mask',
      required: true,
    },
  },
  outputs: {
    filtered: {
      type: 'Data[]',
      label: 'Filtered',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listFilter',
      params: {
        list: inputs.list,
        mask: inputs.mask,
      },
    });

    return {
      filtered: result,
    };
  },
};
