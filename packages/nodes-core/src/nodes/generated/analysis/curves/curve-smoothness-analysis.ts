import type { NodeDefinition } from '@sim4d/types';

interface CurveSmoothnessAnalysisParams {
  continuityLevel: string;
  tolerance: number;
  showBreaks: boolean;
}

interface CurveSmoothnessAnalysisInputs {
  curve: unknown;
}

interface CurveSmoothnessAnalysisOutputs {
  isSmooth: unknown;
  breakPoints: Array<[number, number, number]>;
  continuityReport: unknown;
}

export const AnalysisCurvesCurveSmoothnessAnalysisNode: NodeDefinition<
  CurveSmoothnessAnalysisInputs,
  CurveSmoothnessAnalysisOutputs,
  CurveSmoothnessAnalysisParams
> = {
  id: 'Analysis::CurveSmoothnessAnalysis',
  type: 'Analysis::CurveSmoothnessAnalysis',
  category: 'Analysis',
  label: 'CurveSmoothnessAnalysis',
  description: 'Analyze curve continuity and smoothness',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    isSmooth: {
      type: 'boolean',
      label: 'Is Smooth',
    },
    breakPoints: {
      type: 'Point[]',
      label: 'Break Points',
    },
    continuityReport: {
      type: 'Properties',
      label: 'Continuity Report',
    },
  },
  params: {
    continuityLevel: {
      type: 'enum',
      label: 'Continuity Level',
      default: 'G2',
      options: ['C0', 'C1', 'C2', 'G1', 'G2'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    showBreaks: {
      type: 'boolean',
      label: 'Show Breaks',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveSmoothness',
      params: {
        curve: inputs.curve,
        continuityLevel: params.continuityLevel,
        tolerance: params.tolerance,
        showBreaks: params.showBreaks,
      },
    });

    return {
      isSmooth: results.isSmooth,
      breakPoints: results.breakPoints,
      continuityReport: results.continuityReport,
    };
  },
};
