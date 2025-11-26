import { NodeDefinition } from '@sim4d/types';

interface Params {
  k: number;
  iterations: number;
}
interface Inputs {
  points: Point[];
}
interface Outputs {
  clusters: Point[][];
  centroids: Point[];
}

export const KMeansClusteringNode: NodeDefinition<
  KMeansClusteringInputs,
  KMeansClusteringOutputs,
  KMeansClusteringParams
> = {
  type: 'Patterns::KMeansClustering',
  category: 'Patterns',
  subcategory: 'Algorithmic',

  metadata: {
    label: 'KMeansClustering',
    description: 'K-means point clustering',
  },

  params: {
    k: {
      default: 5,
      min: 2,
      max: 20,
      step: 1,
    },
    iterations: {
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
  },

  inputs: {
    points: 'Point[]',
  },

  outputs: {
    clusters: 'Point[][]',
    centroids: 'Point[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'kmeansClustering',
      params: {
        points: inputs.points,
        k: params.k,
        iterations: params.iterations,
      },
    });

    return {
      clusters: result,
      centroids: result,
    };
  },
};
