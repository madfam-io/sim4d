import type { NodeDefinition } from '@sim4d/types';

interface ListItemParams {
  wrap: boolean;
}

interface ListItemInputs {
  list: unknown;
  index: unknown;
}

interface ListItemOutputs {
  item: unknown;
}

export const DataListListItemNode: NodeDefinition<ListItemInputs, ListItemOutputs, ListItemParams> =
  {
    id: 'Data::ListItem',
    category: 'Data',
    label: 'ListItem',
    description: 'Get item at index',
    inputs: {
      list: {
        type: 'Data[]',
        label: 'List',
        required: true,
      },
      index: {
        type: 'number',
        label: 'Index',
        required: true,
      },
    },
    outputs: {
      item: {
        type: 'Data',
        label: 'Item',
      },
    },
    params: {
      wrap: {
        type: 'boolean',
        label: 'Wrap',
        default: false,
      },
    },
    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'listItem',
        params: {
          list: inputs.list,
          index: inputs.index,
          wrap: params.wrap,
        },
      });

      return {
        item: result,
      };
    },
  };
