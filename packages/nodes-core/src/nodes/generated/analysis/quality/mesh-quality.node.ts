import type { NodeDefinition } from '@brepflow/types';

interface MeshQualityParams {
  aspectRatioThreshold: number;
  skewnessThreshold: number;
}

interface MeshQualityInputs {
  mesh: unknown;
}

interface MeshQualityOutputs {
  averageAspectRatio: unknown;
  maxSkewness: unknown;
  problemElements: unknown;
  qualityReport: unknown;
}

export const AnalysisQualityMeshQualityNode: NodeDefinition<
  MeshQualityInputs,
  MeshQualityOutputs,
  MeshQualityParams
> = {
  id: 'Analysis::MeshQuality',
  category: 'Analysis',
  label: 'MeshQuality',
  description: 'Analyze mesh quality metrics',
  inputs: {
    mesh: {
      type: 'Shape',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    averageAspectRatio: {
      type: 'number',
      label: 'Average Aspect Ratio',
    },
    maxSkewness: {
      type: 'number',
      label: 'Max Skewness',
    },
    problemElements: {
      type: 'Shape[]',
      label: 'Problem Elements',
    },
    qualityReport: {
      type: 'Properties',
      label: 'Quality Report',
    },
  },
  params: {
    aspectRatioThreshold: {
      type: 'number',
      label: 'Aspect Ratio Threshold',
      default: 5,
      min: 1,
      max: 20,
    },
    skewnessThreshold: {
      type: 'number',
      label: 'Skewness Threshold',
      default: 0.8,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'meshQuality',
      params: {
        mesh: inputs.mesh,
        aspectRatioThreshold: params.aspectRatioThreshold,
        skewnessThreshold: params.skewnessThreshold,
      },
    });

    return {
      averageAspectRatio: results.averageAspectRatio,
      maxSkewness: results.maxSkewness,
      problemElements: results.problemElements,
      qualityReport: results.qualityReport,
    };
  },
};
