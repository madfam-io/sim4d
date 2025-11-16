import type { NodeDefinition } from '@brepflow/types';

interface TreeFlattenParams {
  depth: number;
}

interface TreeFlattenInputs {
  tree: unknown;
}

interface TreeFlattenOutputs {
  flattened: unknown;
}

export const DataTreeTreeFlattenNode: NodeDefinition<
  TreeFlattenInputs,
  TreeFlattenOutputs,
  TreeFlattenParams
> = {
  id: 'Data::TreeFlatten',
  category: 'Data',
  label: 'TreeFlatten',
  description: 'Flatten tree',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    flattened: {
      type: 'DataTree',
      label: 'Flattened',
    },
  },
  params: {
    depth: {
      type: 'number',
      label: 'Depth',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeFlatten',
      params: {
        tree: inputs.tree,
        depth: params.depth,
      },
    });

    return {
      flattened: result,
    };
  },
};
