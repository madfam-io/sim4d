import type { NodeDefinition } from '@brepflow/types';

interface ListSortParams {
  ascending: boolean;
}

interface ListSortInputs {
  list: unknown;
  keys?: unknown;
}

interface ListSortOutputs {
  sorted: unknown;
  indices: unknown;
}

export const DataListListSortNode: NodeDefinition<ListSortInputs, ListSortOutputs, ListSortParams> =
  {
    id: 'Data::ListSort',
    type: 'Data::ListSort',
    category: 'Data',
    label: 'ListSort',
    description: 'Sort list',
    inputs: {
      list: {
        type: 'Data[]',
        label: 'List',
        required: true,
      },
      keys: {
        type: 'number[]',
        label: 'Keys',
        optional: true,
      },
    },
    outputs: {
      sorted: {
        type: 'Data[]',
        label: 'Sorted',
      },
      indices: {
        type: 'number[]',
        label: 'Indices',
      },
    },
    params: {
      ascending: {
        type: 'boolean',
        label: 'Ascending',
        default: true,
      },
    },
    async evaluate(context, inputs, params) {
      const results = await context.geometry.execute({
        type: 'listSort',
        params: {
          list: inputs.list,
          keys: inputs.keys,
          ascending: params.ascending,
        },
      });

      return {
        sorted: results.sorted,
        indices: results.indices,
      };
    },
  };
