import type { NodeDefinition } from '@brepflow/types';

type MinimumSpanningTreeParams = Record<string, never>;

interface MinimumSpanningTreeInputs {
  points: Array<[number, number, number]>;
}

interface MinimumSpanningTreeOutputs {
  tree: unknown;
}

export const PatternsNetworkMinimumSpanningTreeNode: NodeDefinition<
  MinimumSpanningTreeInputs,
  MinimumSpanningTreeOutputs,
  MinimumSpanningTreeParams
> = {
  id: 'Patterns::MinimumSpanningTree',
  type: 'Patterns::MinimumSpanningTree',
  category: 'Patterns',
  label: 'MinimumSpanningTree',
  description: 'MST network pattern',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    tree: {
      type: 'Wire[]',
      label: 'Tree',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'minimumSpanningTree',
      params: {
        points: inputs.points,
      },
    });

    return {
      tree: result,
    };
  },
};
