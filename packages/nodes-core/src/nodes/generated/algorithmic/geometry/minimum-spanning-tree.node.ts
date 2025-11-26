import type { NodeDefinition } from '@sim4d/types';

interface MinimumSpanningTreeParams {
  algorithm: string;
  showWeights: boolean;
}

interface MinimumSpanningTreeInputs {
  points: Array<[number, number, number]>;
}

interface MinimumSpanningTreeOutputs {
  tree: unknown;
  totalWeight: unknown;
  edges: unknown;
}

export const AlgorithmicGeometryMinimumSpanningTreeNode: NodeDefinition<
  MinimumSpanningTreeInputs,
  MinimumSpanningTreeOutputs,
  MinimumSpanningTreeParams
> = {
  id: 'Algorithmic::MinimumSpanningTree',
  category: 'Algorithmic',
  label: 'MinimumSpanningTree',
  description: 'Compute minimum spanning tree of points',
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
    totalWeight: {
      type: 'number',
      label: 'Total Weight',
    },
    edges: {
      type: 'Properties[]',
      label: 'Edges',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'kruskal',
      options: ['kruskal', 'prim'],
    },
    showWeights: {
      type: 'boolean',
      label: 'Show Weights',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'minimumSpanningTree',
      params: {
        points: inputs.points,
        algorithm: params.algorithm,
        showWeights: params.showWeights,
      },
    });

    return {
      tree: results.tree,
      totalWeight: results.totalWeight,
      edges: results.edges,
    };
  },
};
