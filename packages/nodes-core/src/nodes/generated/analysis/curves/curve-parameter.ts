import type { NodeDefinition } from '@brepflow/types';

interface CurveParameterParams {
  samples: number;
  showParameter: boolean;
}

interface CurveParameterInputs {
  curve: unknown;
}

interface CurveParameterOutputs {
  parameterRange: unknown;
  samplePoints: Array<[number, number, number]>;
  parameterValues: unknown;
}

export const AnalysisCurvesCurveParameterNode: NodeDefinition<
  CurveParameterInputs,
  CurveParameterOutputs,
  CurveParameterParams
> = {
  id: 'Analysis::CurveParameter',
  type: 'Analysis::CurveParameter',
  category: 'Analysis',
  label: 'CurveParameter',
  description: 'Analyze curve parameterization',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    parameterRange: {
      type: 'number[]',
      label: 'Parameter Range',
    },
    samplePoints: {
      type: 'Point[]',
      label: 'Sample Points',
    },
    parameterValues: {
      type: 'number[]',
      label: 'Parameter Values',
    },
  },
  params: {
    samples: {
      type: 'number',
      label: 'Samples',
      default: 50,
      min: 10,
      max: 200,
    },
    showParameter: {
      type: 'boolean',
      label: 'Show Parameter',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveParameter',
      params: {
        curve: inputs.curve,
        samples: params.samples,
        showParameter: params.showParameter,
      },
    });

    return {
      parameterRange: results.parameterRange,
      samplePoints: results.samplePoints,
      parameterValues: results.parameterValues,
    };
  },
};
