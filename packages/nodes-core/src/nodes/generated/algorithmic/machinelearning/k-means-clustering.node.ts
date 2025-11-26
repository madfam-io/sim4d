import { NodeDefinition } from '@sim4d/types';

interface Params {
  clusters: number;
  maxIterations: number;
  tolerance: number;
  randomSeed: number;
}
interface Inputs {
  data: Point[];
}
interface Outputs {
  centroids: Point[];
  labels: number[];
  clusters: Point[][];
  inertia: number;
}

export const KMeansClusteringNode: NodeDefinition<
  KMeansClusteringInputs,
  KMeansClusteringOutputs,
  KMeansClusteringParams
> = {
  type: 'Algorithmic::KMeansClustering',
  category: 'Algorithmic',
  subcategory: 'MachineLearning',

  metadata: {
    label: 'KMeansClustering',
    description: 'K-means clustering algorithm',
  },

  params: {
    clusters: {
      default: 3,
      min: 2,
      max: 20,
    },
    maxIterations: {
      default: 100,
      min: 10,
      max: 1000,
    },
    tolerance: {
      default: 0.001,
      min: 0.000001,
      max: 0.1,
    },
    randomSeed: {
      default: 42,
      min: 0,
      max: 1000,
    },
  },

  inputs: {
    data: 'Point[]',
  },

  outputs: {
    centroids: 'Point[]',
    labels: 'number[]',
    clusters: 'Point[][]',
    inertia: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'kmeansClustering',
      params: {
        data: inputs.data,
        clusters: params.clusters,
        maxIterations: params.maxIterations,
        tolerance: params.tolerance,
        randomSeed: params.randomSeed,
      },
    });

    return {
      centroids: result,
      labels: result,
      clusters: result,
      inertia: result,
    };
  },
};
