import type { NodeDefinition } from '@sim4d/types';

interface SurfaceContinuityParams {
  continuityType: string;
  tolerance: number;
  showAnalysis: boolean;
}

interface SurfaceContinuityInputs {
  surface1: unknown;
  surface2: unknown;
}

interface SurfaceContinuityOutputs {
  isContinuous: unknown;
  discontinuityPoints: Array<[number, number, number]>;
  analysisLines: unknown;
}

export const AnalysisSurfacesSurfaceContinuityNode: NodeDefinition<
  SurfaceContinuityInputs,
  SurfaceContinuityOutputs,
  SurfaceContinuityParams
> = {
  id: 'Analysis::SurfaceContinuity',
  type: 'Analysis::SurfaceContinuity',
  category: 'Analysis',
  label: 'SurfaceContinuity',
  description: 'Analyze surface continuity across edges',
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
    isContinuous: {
      type: 'boolean',
      label: 'Is Continuous',
    },
    discontinuityPoints: {
      type: 'Point[]',
      label: 'Discontinuity Points',
    },
    analysisLines: {
      type: 'Wire[]',
      label: 'Analysis Lines',
    },
  },
  params: {
    continuityType: {
      type: 'enum',
      label: 'Continuity Type',
      default: 'G1',
      options: ['G0', 'G1', 'G2', 'C0', 'C1', 'C2'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    showAnalysis: {
      type: 'boolean',
      label: 'Show Analysis',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceContinuity',
      params: {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        continuityType: params.continuityType,
        tolerance: params.tolerance,
        showAnalysis: params.showAnalysis,
      },
    });

    return {
      isContinuous: results.isContinuous,
      discontinuityPoints: results.discontinuityPoints,
      analysisLines: results.analysisLines,
    };
  },
};
