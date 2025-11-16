import type { NodeDefinition } from '@brepflow/types';

interface GraphLayoutParams {
  algorithm: string;
  iterations: number;
}

interface GraphLayoutInputs {
  nodes: Array<[number, number, number]>;
  edges: unknown;
}

interface GraphLayoutOutputs {
  layout: Array<[number, number, number]>;
  graph: unknown;
}

export const PatternsAlgorithmicGraphLayoutNode: NodeDefinition<
  GraphLayoutInputs,
  GraphLayoutOutputs,
  GraphLayoutParams
> = {
  id: 'Patterns::GraphLayout',
  type: 'Patterns::GraphLayout',
  category: 'Patterns',
  label: 'GraphLayout',
  description: 'Graph layout algorithms',
  inputs: {
    nodes: {
      type: 'Point[]',
      label: 'Nodes',
      required: true,
    },
    edges: {
      type: 'Data',
      label: 'Edges',
      required: true,
    },
  },
  outputs: {
    layout: {
      type: 'Point[]',
      label: 'Layout',
    },
    graph: {
      type: 'Wire[]',
      label: 'Graph',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'force-directed',
      options: ['force-directed', 'circular', 'hierarchical', 'spectral'],
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'graphLayout',
      params: {
        nodes: inputs.nodes,
        edges: inputs.edges,
        algorithm: params.algorithm,
        iterations: params.iterations,
      },
    });

    return {
      layout: results.layout,
      graph: results.graph,
    };
  },
};
