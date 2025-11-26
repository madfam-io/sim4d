import type { NodeDefinition } from '@sim4d/types';

interface CentroidalVoronoiParams {
  iterations: number;
  convergence: number;
}

interface CentroidalVoronoiInputs {
  points: Array<[number, number, number]>;
  boundary?: unknown;
}

interface CentroidalVoronoiOutputs {
  cells: unknown;
  centroids: Array<[number, number, number]>;
}

export const PatternsVoronoiCentroidalVoronoiNode: NodeDefinition<
  CentroidalVoronoiInputs,
  CentroidalVoronoiOutputs,
  CentroidalVoronoiParams
> = {
  id: 'Patterns::CentroidalVoronoi',
  category: 'Patterns',
  label: 'CentroidalVoronoi',
  description: 'Lloyd relaxation Voronoi',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      optional: true,
    },
  },
  outputs: {
    cells: {
      type: 'Wire[]',
      label: 'Cells',
    },
    centroids: {
      type: 'Point[]',
      label: 'Centroids',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    convergence: {
      type: 'number',
      label: 'Convergence',
      default: 0.001,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'voronoiCentroidal',
      params: {
        points: inputs.points,
        boundary: inputs.boundary,
        iterations: params.iterations,
        convergence: params.convergence,
      },
    });

    return {
      cells: results.cells,
      centroids: results.centroids,
    };
  },
};
