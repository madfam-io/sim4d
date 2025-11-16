import type { NodeDefinition } from '@brepflow/types';

interface SurfaceNormalsParams {
  density: number;
  vectorLength: number;
  showVectors: boolean;
}

interface SurfaceNormalsInputs {
  surface: unknown;
}

interface SurfaceNormalsOutputs {
  normalVectors: Array<[number, number, number]>;
  normalLines: unknown;
  samplePoints: Array<[number, number, number]>;
}

export const AnalysisSurfacesSurfaceNormalsNode: NodeDefinition<
  SurfaceNormalsInputs,
  SurfaceNormalsOutputs,
  SurfaceNormalsParams
> = {
  id: 'Analysis::SurfaceNormals',
  category: 'Analysis',
  label: 'SurfaceNormals',
  description: 'Calculate surface normal vectors',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    normalVectors: {
      type: 'Vector[]',
      label: 'Normal Vectors',
    },
    normalLines: {
      type: 'Wire[]',
      label: 'Normal Lines',
    },
    samplePoints: {
      type: 'Point[]',
      label: 'Sample Points',
    },
  },
  params: {
    density: {
      type: 'number',
      label: 'Density',
      default: 20,
      min: 5,
      max: 100,
    },
    vectorLength: {
      type: 'number',
      label: 'Vector Length',
      default: 5,
      min: 1,
      max: 50,
    },
    showVectors: {
      type: 'boolean',
      label: 'Show Vectors',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceNormals',
      params: {
        surface: inputs.surface,
        density: params.density,
        vectorLength: params.vectorLength,
        showVectors: params.showVectors,
      },
    });

    return {
      normalVectors: results.normalVectors,
      normalLines: results.normalLines,
      samplePoints: results.samplePoints,
    };
  },
};
