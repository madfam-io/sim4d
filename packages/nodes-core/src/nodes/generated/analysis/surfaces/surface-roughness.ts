import type { NodeDefinition } from '@sim4d/types';

interface SurfaceRoughnessParams {
  sampleDensity: number;
  analysisType: string;
}

interface SurfaceRoughnessInputs {
  surface: unknown;
}

interface SurfaceRoughnessOutputs {
  roughnessRa: unknown;
  roughnessRz: unknown;
  roughnessRq: unknown;
  roughnessMap: unknown;
}

export const AnalysisSurfacesSurfaceRoughnessNode: NodeDefinition<
  SurfaceRoughnessInputs,
  SurfaceRoughnessOutputs,
  SurfaceRoughnessParams
> = {
  id: 'Analysis::SurfaceRoughness',
  type: 'Analysis::SurfaceRoughness',
  category: 'Analysis',
  label: 'SurfaceRoughness',
  description: 'Calculate surface roughness metrics',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    roughnessRa: {
      type: 'number',
      label: 'Roughness Ra',
    },
    roughnessRz: {
      type: 'number',
      label: 'Roughness Rz',
    },
    roughnessRq: {
      type: 'number',
      label: 'Roughness Rq',
    },
    roughnessMap: {
      type: 'Shape',
      label: 'Roughness Map',
    },
  },
  params: {
    sampleDensity: {
      type: 'number',
      label: 'Sample Density',
      default: 50,
      min: 10,
      max: 200,
    },
    analysisType: {
      type: 'enum',
      label: 'Analysis Type',
      default: 'all',
      options: ['Ra', 'Rz', 'Rq', 'all'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceRoughness',
      params: {
        surface: inputs.surface,
        sampleDensity: params.sampleDensity,
        analysisType: params.analysisType,
      },
    });

    return {
      roughnessRa: results.roughnessRa,
      roughnessRz: results.roughnessRz,
      roughnessRq: results.roughnessRq,
      roughnessMap: results.roughnessMap,
    };
  },
};
