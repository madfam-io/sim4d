import type { NodeDefinition } from '@brepflow/types';

interface SurfaceDeviationParams {
  samples: number;
  colorMap: boolean;
  tolerance: number;
}

interface SurfaceDeviationInputs {
  testSurface: unknown;
  referenceSurface: unknown;
}

interface SurfaceDeviationOutputs {
  deviationMap: unknown;
  maxDeviation: unknown;
  averageDeviation: unknown;
  deviationPoints: Array<[number, number, number]>;
}

export const AnalysisSurfacesSurfaceDeviationNode: NodeDefinition<
  SurfaceDeviationInputs,
  SurfaceDeviationOutputs,
  SurfaceDeviationParams
> = {
  id: 'Analysis::SurfaceDeviation',
  type: 'Analysis::SurfaceDeviation',
  category: 'Analysis',
  label: 'SurfaceDeviation',
  description: 'Compare surface deviation from reference',
  inputs: {
    testSurface: {
      type: 'Face',
      label: 'Test Surface',
      required: true,
    },
    referenceSurface: {
      type: 'Face',
      label: 'Reference Surface',
      required: true,
    },
  },
  outputs: {
    deviationMap: {
      type: 'Shape',
      label: 'Deviation Map',
    },
    maxDeviation: {
      type: 'number',
      label: 'Max Deviation',
    },
    averageDeviation: {
      type: 'number',
      label: 'Average Deviation',
    },
    deviationPoints: {
      type: 'Point[]',
      label: 'Deviation Points',
    },
  },
  params: {
    samples: {
      type: 'number',
      label: 'Samples',
      default: 100,
      min: 20,
      max: 500,
    },
    colorMap: {
      type: 'boolean',
      label: 'Color Map',
      default: true,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceDeviation',
      params: {
        testSurface: inputs.testSurface,
        referenceSurface: inputs.referenceSurface,
        samples: params.samples,
        colorMap: params.colorMap,
        tolerance: params.tolerance,
      },
    });

    return {
      deviationMap: results.deviationMap,
      maxDeviation: results.maxDeviation,
      averageDeviation: results.averageDeviation,
      deviationPoints: results.deviationPoints,
    };
  },
};
