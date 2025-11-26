import type { NodeDefinition } from '@sim4d/types';

type TreeMergeParams = Record<string, never>;

interface TreeMergeInputs {
  treeA: unknown;
  treeB: unknown;
}

interface TreeMergeOutputs {
  merged: unknown;
}

export const DataTreeTreeMergeNode: NodeDefinition<
  TreeMergeInputs,
  TreeMergeOutputs,
  TreeMergeParams
> = {
  id: 'Data::TreeMerge',
  type: 'Data::TreeMerge',
  category: 'Data',
  label: 'TreeMerge',
  description: 'Merge trees',
  inputs: {
    treeA: {
      type: 'DataTree',
      label: 'Tree A',
      required: true,
    },
    treeB: {
      type: 'DataTree',
      label: 'Tree B',
      required: true,
    },
  },
  outputs: {
    merged: {
      type: 'DataTree',
      label: 'Merged',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeMerge',
      params: {
        treeA: inputs.treeA,
        treeB: inputs.treeB,
      },
    });

    return {
      merged: result,
    };
  },
};
