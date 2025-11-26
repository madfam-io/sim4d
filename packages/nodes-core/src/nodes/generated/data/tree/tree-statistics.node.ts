import type { NodeDefinition } from '@sim4d/types';

type TreeStatisticsParams = Record<string, never>;

interface TreeStatisticsInputs {
  tree: unknown;
}

interface TreeStatisticsOutputs {
  branchCount: unknown;
  itemCount: unknown;
  depth: unknown;
}

export const DataTreeTreeStatisticsNode: NodeDefinition<
  TreeStatisticsInputs,
  TreeStatisticsOutputs,
  TreeStatisticsParams
> = {
  id: 'Data::TreeStatistics',
  category: 'Data',
  label: 'TreeStatistics',
  description: 'Tree statistics',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
  },
  outputs: {
    branchCount: {
      type: 'number',
      label: 'Branch Count',
    },
    itemCount: {
      type: 'number',
      label: 'Item Count',
    },
    depth: {
      type: 'number',
      label: 'Depth',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'treeStatistics',
      params: {
        tree: inputs.tree,
      },
    });

    return {
      branchCount: results.branchCount,
      itemCount: results.itemCount,
      depth: results.depth,
    };
  },
};
