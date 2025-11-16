import type { NodeDefinition } from '@brepflow/types';

interface KMeansClusteringParams {
  clusters: number;
  maxIterations: number;
  tolerance: number;
  randomSeed: number;
}

interface KMeansClusteringInputs {
  data: Array<[number, number, number]>;
}

interface KMeansClusteringOutputs {
  centroids: Array<[number, number, number]>;
  labels: unknown;
  clusters: unknown;
  inertia: unknown;
}

export const AlgorithmicMachineLearningKMeansClusteringNode: NodeDefinition<
  KMeansClusteringInputs,
  KMeansClusteringOutputs,
  KMeansClusteringParams
> = {
  id: 'Algorithmic::KMeansClustering',
  type: 'Algorithmic::KMeansClustering',
  category: 'Algorithmic',
  label: 'KMeansClustering',
  description: 'K-means clustering algorithm',
  inputs: {
    data: {
      type: 'Point[]',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    centroids: {
      type: 'Point[]',
      label: 'Centroids',
    },
    labels: {
      type: 'number[]',
      label: 'Labels',
    },
    clusters: {
      type: 'Point[][]',
      label: 'Clusters',
    },
    inertia: {
      type: 'number',
      label: 'Inertia',
    },
  },
  params: {
    clusters: {
      type: 'number',
      label: 'Clusters',
      default: 3,
      min: 2,
      max: 20,
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 100,
      min: 10,
      max: 1000,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0.000001,
      max: 0.1,
    },
    randomSeed: {
      type: 'number',
      label: 'Random Seed',
      default: 42,
      min: 0,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      centroids: results.centroids,
      labels: results.labels,
      clusters: results.clusters,
      inertia: results.inertia,
    };
  },
};
