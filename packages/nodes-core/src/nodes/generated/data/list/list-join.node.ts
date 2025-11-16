import type { NodeDefinition } from '@brepflow/types';

type ListJoinParams = Record<string, never>;

interface ListJoinInputs {
  lists: unknown;
}

interface ListJoinOutputs {
  joined: unknown;
}

export const DataListListJoinNode: NodeDefinition<ListJoinInputs, ListJoinOutputs, ListJoinParams> =
  {
    id: 'Data::ListJoin',
    category: 'Data',
    label: 'ListJoin',
    description: 'Join multiple lists',
    inputs: {
      lists: {
        type: 'Data[][]',
        label: 'Lists',
        required: true,
      },
    },
    outputs: {
      joined: {
        type: 'Data[]',
        label: 'Joined',
      },
    },
    params: {},
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'listJoin',
        params: {
          lists: inputs.lists,
        },
      });

      return {
        joined: result,
      };
    },
  };
