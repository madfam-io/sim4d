import type { NodeDefinition } from '@sim4d/types';

type ListRemoveParams = Record<string, never>;

interface ListRemoveInputs {
  list: unknown;
  index: unknown;
}

interface ListRemoveOutputs {
  result: unknown;
  removed: unknown;
}

export const DataListListRemoveNode: NodeDefinition<
  ListRemoveInputs,
  ListRemoveOutputs,
  ListRemoveParams
> = {
  id: 'Data::ListRemove',
  category: 'Data',
  label: 'ListRemove',
  description: 'Remove item from list',
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
    result: {
      type: 'Data[]',
      label: 'Result',
    },
    removed: {
      type: 'Data',
      label: 'Removed',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'listRemove',
      params: {
        list: inputs.list,
        index: inputs.index,
      },
    });

    return {
      result: results.result,
      removed: results.removed,
    };
  },
};
