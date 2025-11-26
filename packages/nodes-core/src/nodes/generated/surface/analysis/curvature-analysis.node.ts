import type { NodeDefinition } from '@sim4d/types';

interface CurvatureAnalysisParams {
  analysisType: string;
  sampleDensity: number;
}

interface CurvatureAnalysisInputs {
  surface: unknown;
}

interface CurvatureAnalysisOutputs {
  analysis: unknown;
  visualization: unknown;
}

export const SurfaceAnalysisCurvatureAnalysisNode: NodeDefinition<
  CurvatureAnalysisInputs,
  CurvatureAnalysisOutputs,
  CurvatureAnalysisParams
> = {
  id: 'Surface::CurvatureAnalysis',
  category: 'Surface',
  label: 'CurvatureAnalysis',
  description: 'Analyze surface curvature',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    analysis: {
      type: 'Data',
      label: 'Analysis',
    },
    visualization: {
      type: 'Shape',
      label: 'Visualization',
    },
  },
  params: {
    analysisType: {
      type: 'enum',
      label: 'Analysis Type',
      default: 'gaussian',
      options: ['gaussian', 'mean', 'principal', 'radius'],
    },
    sampleDensity: {
      type: 'number',
      label: 'Sample Density',
      default: 50,
      min: 10,
      max: 200,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curvatureAnalysis',
      params: {
        surface: inputs.surface,
        analysisType: params.analysisType,
        sampleDensity: params.sampleDensity,
      },
    });

    return {
      analysis: results.analysis,
      visualization: results.visualization,
    };
  },
};
