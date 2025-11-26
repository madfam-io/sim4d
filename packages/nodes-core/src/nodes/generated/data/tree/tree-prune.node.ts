import type { NodeDefinition } from '@sim4d/types';

type TreePruneParams = Record<string, never>;

interface TreePruneInputs {
  tree: unknown;
}

interface TreePruneOutputs {
  pruned: unknown;
}

export const DataTreeTreePruneNode: NodeDefinition<
  TreePruneInputs,
  TreePruneOutputs,
  TreePruneParams
> = {
  id: 'Data::TreePrune',
  category: 'Data',
  label: 'TreePrune',
  description: 'Remove empty branches',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    pruned: {
      type: 'DataTree',
      label: 'Pruned',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treePrune',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      pruned: result,
    };
  },
};
