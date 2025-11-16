import type { NodeDefinition } from '@brepflow/types';

type TreeExplodeParams = Record<string, never>;

interface TreeExplodeInputs {
  tree: unknown;
}

interface TreeExplodeOutputs {
  branches: unknown;
}

export const DataTreeTreeExplodeNode: NodeDefinition<
  TreeExplodeInputs,
  TreeExplodeOutputs,
  TreeExplodeParams
> = {
  id: 'Data::TreeExplode',
  type: 'Data::TreeExplode',
  category: 'Data',
  label: 'TreeExplode',
  description: 'Explode tree to branches',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    branches: {
      type: 'Data[][]',
      label: 'Branches',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeExplode',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      branches: result,
    };
  },
};
