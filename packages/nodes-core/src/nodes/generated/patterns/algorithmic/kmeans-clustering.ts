import type { NodeDefinition } from '@sim4d/types';

interface KMeansClusteringParams {
  k: number;
  iterations: number;
}

interface KMeansClusteringInputs {
  points: Array<[number, number, number]>;
}

interface KMeansClusteringOutputs {
  clusters: unknown;
  centroids: Array<[number, number, number]>;
}

export const PatternsAlgorithmicKMeansClusteringNode: NodeDefinition<
  KMeansClusteringInputs,
  KMeansClusteringOutputs,
  KMeansClusteringParams
> = {
  id: 'Patterns::KMeansClustering',
  type: 'Patterns::KMeansClustering',
  category: 'Patterns',
  label: 'KMeansClustering',
  description: 'K-means point clustering',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    clusters: {
      type: 'Point[][]',
      label: 'Clusters',
    },
    centroids: {
      type: 'Point[]',
      label: 'Centroids',
    },
  },
  params: {
    k: {
      type: 'number',
      label: 'K',
      default: 5,
      min: 2,
      max: 20,
      step: 1,
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
      type: 'kmeansClustering',
      params: {
        points: inputs.points,
        k: params.k,
        iterations: params.iterations,
      },
    });

    return {
      clusters: results.clusters,
      centroids: results.centroids,
    };
  },
};
