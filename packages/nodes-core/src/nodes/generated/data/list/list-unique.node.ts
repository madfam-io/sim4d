import type { NodeDefinition } from '@sim4d/types';

type ListUniqueParams = Record<string, never>;

interface ListUniqueInputs {
  list: unknown;
}

interface ListUniqueOutputs {
  unique: unknown;
}

export const DataListListUniqueNode: NodeDefinition<
  ListUniqueInputs,
  ListUniqueOutputs,
  ListUniqueParams
> = {
  id: 'Data::ListUnique',
  category: 'Data',
  label: 'ListUnique',
  description: 'Remove duplicates',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    unique: {
      type: 'Data[]',
      label: 'Unique',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listUnique',
      params: {
        list: inputs.list,
      },
    });

    return {
      unique: result,
    };
  },
};
