import type { NodeDefinition } from '@sim4d/types';

type TreeGraftParams = Record<string, never>;

interface TreeGraftInputs {
  tree: unknown;
}

interface TreeGraftOutputs {
  grafted: unknown;
}

export const DataTreeTreeGraftNode: NodeDefinition<
  TreeGraftInputs,
  TreeGraftOutputs,
  TreeGraftParams
> = {
  id: 'Data::TreeGraft',
  category: 'Data',
  label: 'TreeGraft',
  description: 'Graft tree',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    grafted: {
      type: 'DataTree',
      label: 'Grafted',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeGraft',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      grafted: result,
    };
  },
};
