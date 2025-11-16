import type { NodeDefinition } from '@brepflow/types';

interface SurfaceDeviationParams {
  sampleCount: number;
}

interface SurfaceDeviationInputs {
  surface1: unknown;
  surface2: unknown;
}

interface SurfaceDeviationOutputs {
  maxDeviation: unknown;
  avgDeviation: unknown;
  deviationMap: unknown;
}

export const SurfaceAnalysisSurfaceDeviationNode: NodeDefinition<
  SurfaceDeviationInputs,
  SurfaceDeviationOutputs,
  SurfaceDeviationParams
> = {
  id: 'Surface::SurfaceDeviation',
  category: 'Surface',
  label: 'SurfaceDeviation',
  description: 'Measure surface deviation',
  inputs: {
    surface1: {
      type: 'Face',
      label: 'Surface1',
      required: true,
    },
    surface2: {
      type: 'Face',
      label: 'Surface2',
      required: true,
    },
  },
  outputs: {
    maxDeviation: {
      type: 'number',
      label: 'Max Deviation',
    },
    avgDeviation: {
      type: 'number',
      label: 'Avg Deviation',
    },
    deviationMap: {
      type: 'Data',
      label: 'Deviation Map',
    },
  },
  params: {
    sampleCount: {
      type: 'number',
      label: 'Sample Count',
      default: 1000,
      min: 100,
      max: 10000,
      step: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceDeviation',
      params: {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        sampleCount: params.sampleCount,
      },
    });

    return {
      maxDeviation: results.maxDeviation,
      avgDeviation: results.avgDeviation,
      deviationMap: results.deviationMap,
    };
  },
};
