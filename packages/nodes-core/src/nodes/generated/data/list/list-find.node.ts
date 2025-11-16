import type { NodeDefinition } from '@brepflow/types';

type ListFindParams = Record<string, never>;

interface ListFindInputs {
  list: unknown;
  pattern: unknown;
}

interface ListFindOutputs {
  items: unknown;
  indices: unknown;
}

export const DataListListFindNode: NodeDefinition<ListFindInputs, ListFindOutputs, ListFindParams> =
  {
    id: 'Data::ListFind',
    category: 'Data',
    label: 'ListFind',
    description: 'Find items matching condition',
    inputs: {
      list: {
        type: 'Data[]',
        label: 'List',
        required: true,
      },
      pattern: {
        type: 'Data',
        label: 'Pattern',
        required: true,
      },
    },
    outputs: {
      items: {
        type: 'Data[]',
        label: 'Items',
      },
      indices: {
        type: 'number[]',
        label: 'Indices',
      },
    },
    params: {},
    async evaluate(context, inputs, params) {
      const results = await context.geometry.execute({
        type: 'listFind',
        params: {
          list: inputs.list,
          pattern: inputs.pattern,
        },
      });

      return {
        items: results.items,
        indices: results.indices,
      };
    },
  };
