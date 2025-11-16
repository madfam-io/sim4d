import type { NodeDefinition } from '@brepflow/types';

interface ShortestPathParams {
  algorithm: string;
}

interface ShortestPathInputs {
  graph: unknown;
  start: [number, number, number];
  end: [number, number, number];
}

interface ShortestPathOutputs {
  path: unknown;
  distance: number;
}

export const PatternsAlgorithmicShortestPathNode: NodeDefinition<
  ShortestPathInputs,
  ShortestPathOutputs,
  ShortestPathParams
> = {
  id: 'Patterns::ShortestPath',
  type: 'Patterns::ShortestPath',
  category: 'Patterns',
  label: 'ShortestPath',
  description: 'Shortest path algorithms',
  inputs: {
    graph: {
      type: 'Wire[]',
      label: 'Graph',
      required: true,
    },
    start: {
      type: 'Point',
      label: 'Start',
      required: true,
    },
    end: {
      type: 'Point',
      label: 'End',
      required: true,
    },
  },
  outputs: {
    path: {
      type: 'Wire',
      label: 'Path',
    },
    distance: {
      type: 'Number',
      label: 'Distance',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'dijkstra',
      options: ['dijkstra', 'a-star', 'bellman-ford'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'shortestPath',
      params: {
        graph: inputs.graph,
        start: inputs.start,
        end: inputs.end,
        algorithm: params.algorithm,
      },
    });

    return {
      path: results.path,
      distance: results.distance,
    };
  },
};
