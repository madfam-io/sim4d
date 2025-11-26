import type { NodeDefinition } from '@sim4d/types';

interface ListFlattenParams {
  depth: number;
}

interface ListFlattenInputs {
  list: unknown;
}

interface ListFlattenOutputs {
  flattened: unknown;
}

export const DataListListFlattenNode: NodeDefinition<
  ListFlattenInputs,
  ListFlattenOutputs,
  ListFlattenParams
> = {
  id: 'Data::ListFlatten',
  type: 'Data::ListFlatten',
  category: 'Data',
  label: 'ListFlatten',
  description: 'Flatten nested lists',
  inputs: {
    list: {
      type: 'Data[]',
      label: 'List',
      required: true,
    },
  },
  outputs: {
    flattened: {
      type: 'Data[]',
      label: 'Flattened',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'listFlatten',
      params: {
        list: inputs.list,
        depth: params.depth,
      },
    });

    return {
      flattened: result,
    };
  },
};
