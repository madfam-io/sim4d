import type { NodeDefinition } from '@brepflow/types';

type TreePathsParams = Record<string, never>;

interface TreePathsInputs {
  tree: unknown;
}

interface TreePathsOutputs {
  paths: unknown;
}

export const DataTreeTreePathsNode: NodeDefinition<
  TreePathsInputs,
  TreePathsOutputs,
  TreePathsParams
> = {
  id: 'Data::TreePaths',
  category: 'Data',
  label: 'TreePaths',
  description: 'Get all tree paths',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    paths: {
      type: 'string[]',
      label: 'Paths',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treePaths',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      paths: result,
    };
  },
};
