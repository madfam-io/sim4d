import type { NodeDefinition } from '@brepflow/types';

type TreeBranchParams = Record<string, never>;

interface TreeBranchInputs {
  tree: unknown;
  path: unknown;
}

interface TreeBranchOutputs {
  branch: unknown;
}

export const DataTreeTreeBranchNode: NodeDefinition<
  TreeBranchInputs,
  TreeBranchOutputs,
  TreeBranchParams
> = {
  id: 'Data::TreeBranch',
  type: 'Data::TreeBranch',
  category: 'Data',
  label: 'TreeBranch',
  description: 'Get tree branch',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
    path: {
      type: 'string',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    branch: {
      type: 'Data[]',
      label: 'Branch',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeBranch',
      params: {
        tree: inputs.tree,
        path: inputs.path,
      },
    });

    return {
      branch: result,
    };
  },
};
