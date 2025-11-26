import type { NodeDefinition } from '@sim4d/types';

interface ToleranceAnalysisParams {
  nominalTolerance: number;
  showDeviations: boolean;
}

interface ToleranceAnalysisInputs {
  measured: unknown;
  nominal: unknown;
}

interface ToleranceAnalysisOutputs {
  withinTolerance: unknown;
  maxDeviation: unknown;
  deviationMap: unknown;
}

export const AnalysisQualityToleranceAnalysisNode: NodeDefinition<
  ToleranceAnalysisInputs,
  ToleranceAnalysisOutputs,
  ToleranceAnalysisParams
> = {
  id: 'Analysis::ToleranceAnalysis',
  type: 'Analysis::ToleranceAnalysis',
  category: 'Analysis',
  label: 'ToleranceAnalysis',
  description: 'Analyze geometric tolerances',
  inputs: {
    measured: {
      type: 'Shape',
      label: 'Measured',
      required: true,
    },
    nominal: {
      type: 'Shape',
      label: 'Nominal',
      required: true,
    },
  },
  outputs: {
    withinTolerance: {
      type: 'boolean',
      label: 'Within Tolerance',
    },
    maxDeviation: {
      type: 'number',
      label: 'Max Deviation',
    },
    deviationMap: {
      type: 'Shape',
      label: 'Deviation Map',
    },
  },
  params: {
    nominalTolerance: {
      type: 'number',
      label: 'Nominal Tolerance',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
    showDeviations: {
      type: 'boolean',
      label: 'Show Deviations',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'toleranceAnalysis',
      params: {
        measured: inputs.measured,
        nominal: inputs.nominal,
        nominalTolerance: params.nominalTolerance,
        showDeviations: params.showDeviations,
      },
    });

    return {
      withinTolerance: results.withinTolerance,
      maxDeviation: results.maxDeviation,
      deviationMap: results.deviationMap,
    };
  },
};
