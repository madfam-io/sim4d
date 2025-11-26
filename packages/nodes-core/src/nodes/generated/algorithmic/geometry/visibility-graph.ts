import type { NodeDefinition } from '@sim4d/types';

interface VisibilityGraphParams {
  epsilon: number;
  includeInterior: boolean;
}

interface VisibilityGraphInputs {
  obstacles: unknown;
  start: [number, number, number];
  goal: [number, number, number];
}

interface VisibilityGraphOutputs {
  graph: unknown;
  vertices: Array<[number, number, number]>;
  edges: unknown;
}

export const AlgorithmicGeometryVisibilityGraphNode: NodeDefinition<
  VisibilityGraphInputs,
  VisibilityGraphOutputs,
  VisibilityGraphParams
> = {
  id: 'Algorithmic::VisibilityGraph',
  type: 'Algorithmic::VisibilityGraph',
  category: 'Algorithmic',
  label: 'VisibilityGraph',
  description: 'Compute visibility graph for path planning',
  inputs: {
    obstacles: {
      type: 'Shape[]',
      label: 'Obstacles',
      required: true,
    },
    start: {
      type: 'Point',
      label: 'Start',
      required: true,
    },
    goal: {
      type: 'Point',
      label: 'Goal',
      required: true,
    },
  },
  outputs: {
    graph: {
      type: 'Wire[]',
      label: 'Graph',
    },
    vertices: {
      type: 'Point[]',
      label: 'Vertices',
    },
    edges: {
      type: 'Properties[]',
      label: 'Edges',
    },
  },
  params: {
    epsilon: {
      type: 'number',
      label: 'Epsilon',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    includeInterior: {
      type: 'boolean',
      label: 'Include Interior',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'visibilityGraph',
      params: {
        obstacles: inputs.obstacles,
        start: inputs.start,
        goal: inputs.goal,
        epsilon: params.epsilon,
        includeInterior: params.includeInterior,
      },
    });

    return {
      graph: results.graph,
      vertices: results.vertices,
      edges: results.edges,
    };
  },
};
