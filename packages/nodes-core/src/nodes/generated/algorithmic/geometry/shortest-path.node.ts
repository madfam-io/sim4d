import type { NodeDefinition } from '@brepflow/types';

interface ShortestPathParams {
  algorithm: string;
  heuristic: string;
}

interface ShortestPathInputs {
  graph: unknown;
  start: [number, number, number];
  end: [number, number, number];
}

interface ShortestPathOutputs {
  path: unknown;
  distance: unknown;
  nodes: Array<[number, number, number]>;
}

export const AlgorithmicGeometryShortestPathNode: NodeDefinition<
  ShortestPathInputs,
  ShortestPathOutputs,
  ShortestPathParams
> = {
  id: 'Algorithmic::ShortestPath',
  category: 'Algorithmic',
  label: 'ShortestPath',
  description: 'Find shortest path between points',
  inputs: {
    graph: {
      type: 'Properties',
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
      type: 'number',
      label: 'Distance',
    },
    nodes: {
      type: 'Point[]',
      label: 'Nodes',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'dijkstra',
      options: ['dijkstra', 'astar'],
    },
    heuristic: {
      type: 'enum',
      label: 'Heuristic',
      default: 'euclidean',
      options: ['euclidean', 'manhattan'],
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
        heuristic: params.heuristic,
      },
    });

    return {
      path: results.path,
      distance: results.distance,
      nodes: results.nodes,
    };
  },
};
