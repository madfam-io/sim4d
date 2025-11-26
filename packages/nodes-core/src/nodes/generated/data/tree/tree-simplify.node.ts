import type { NodeDefinition } from '@sim4d/types';

type TreeSimplifyParams = Record<string, never>;

interface TreeSimplifyInputs {
  tree: unknown;
}

interface TreeSimplifyOutputs {
  simplified: unknown;
}

export const DataTreeTreeSimplifyNode: NodeDefinition<
  TreeSimplifyInputs,
  TreeSimplifyOutputs,
  TreeSimplifyParams
> = {
  id: 'Data::TreeSimplify',
  category: 'Data',
  label: 'TreeSimplify',
  description: 'Simplify tree paths',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    simplified: {
      type: 'DataTree',
      label: 'Simplified',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeSimplify',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      simplified: result,
    };
  },
};
