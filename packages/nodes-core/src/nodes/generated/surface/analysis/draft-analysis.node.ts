import type { NodeDefinition } from '@sim4d/types';

interface DraftAnalysisParams {
  pullDirection: [number, number, number];
  requiredAngle: number;
  colorMapping: boolean;
}

interface DraftAnalysisInputs {
  shape: unknown;
}

interface DraftAnalysisOutputs {
  analysis: unknown;
  problematicFaces: unknown;
}

export const SurfaceAnalysisDraftAnalysisNode: NodeDefinition<
  DraftAnalysisInputs,
  DraftAnalysisOutputs,
  DraftAnalysisParams
> = {
  id: 'Surface::DraftAnalysis',
  category: 'Surface',
  label: 'DraftAnalysis',
  description: 'Analyze draft angles',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    analysis: {
      type: 'Data',
      label: 'Analysis',
    },
    problematicFaces: {
      type: 'Face[]',
      label: 'Problematic Faces',
    },
  },
  params: {
    pullDirection: {
      type: 'vec3',
      label: 'Pull Direction',
      default: [0, 0, 1],
    },
    requiredAngle: {
      type: 'number',
      label: 'Required Angle',
      default: 3,
      min: 0,
      max: 90,
    },
    colorMapping: {
      type: 'boolean',
      label: 'Color Mapping',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'draftAnalysis',
      params: {
        shape: inputs.shape,
        pullDirection: params.pullDirection,
        requiredAngle: params.requiredAngle,
        colorMapping: params.colorMapping,
      },
    });

    return {
      analysis: results.analysis,
      problematicFaces: results.problematicFaces,
    };
  },
};
