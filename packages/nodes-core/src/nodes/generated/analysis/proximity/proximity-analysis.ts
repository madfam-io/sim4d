import type { NodeDefinition } from '@sim4d/types';

interface ProximityAnalysisParams {
  threshold: number;
  showConnections: boolean;
}

interface ProximityAnalysisInputs {
  objects: unknown;
}

interface ProximityAnalysisOutputs {
  proximityPairs: unknown;
  distances: unknown;
  connections: unknown;
}

export const AnalysisProximityProximityAnalysisNode: NodeDefinition<
  ProximityAnalysisInputs,
  ProximityAnalysisOutputs,
  ProximityAnalysisParams
> = {
  id: 'Analysis::ProximityAnalysis',
  type: 'Analysis::ProximityAnalysis',
  category: 'Analysis',
  label: 'ProximityAnalysis',
  description: 'Analyze proximity between multiple objects',
  inputs: {
    objects: {
      type: 'Shape[]',
      label: 'Objects',
      required: true,
    },
  },
  outputs: {
    proximityPairs: {
      type: 'Shape[][]',
      label: 'Proximity Pairs',
    },
    distances: {
      type: 'number[]',
      label: 'Distances',
    },
    connections: {
      type: 'Wire[]',
      label: 'Connections',
    },
  },
  params: {
    threshold: {
      type: 'number',
      label: 'Threshold',
      default: 1,
      min: 0.1,
      max: 100,
    },
    showConnections: {
      type: 'boolean',
      label: 'Show Connections',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'proximityAnalysis',
      params: {
        objects: inputs.objects,
        threshold: params.threshold,
        showConnections: params.showConnections,
      },
    });

    return {
      proximityPairs: results.proximityPairs,
      distances: results.distances,
      connections: results.connections,
    };
  },
};
