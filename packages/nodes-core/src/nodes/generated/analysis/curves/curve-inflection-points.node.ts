import type { NodeDefinition } from '@brepflow/types';

interface CurveInflectionPointsParams {
  tolerance: number;
  markPoints: boolean;
}

interface CurveInflectionPointsInputs {
  curve: unknown;
}

interface CurveInflectionPointsOutputs {
  inflectionPoints: Array<[number, number, number]>;
  parameters: unknown;
  markers: unknown;
}

export const AnalysisCurvesCurveInflectionPointsNode: NodeDefinition<
  CurveInflectionPointsInputs,
  CurveInflectionPointsOutputs,
  CurveInflectionPointsParams
> = {
  id: 'Analysis::CurveInflectionPoints',
  category: 'Analysis',
  label: 'CurveInflectionPoints',
  description: 'Find curve inflection points',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    inflectionPoints: {
      type: 'Point[]',
      label: 'Inflection Points',
    },
    parameters: {
      type: 'number[]',
      label: 'Parameters',
    },
    markers: {
      type: 'Shape[]',
      label: 'Markers',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    markPoints: {
      type: 'boolean',
      label: 'Mark Points',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveInflection',
      params: {
        curve: inputs.curve,
        tolerance: params.tolerance,
        markPoints: params.markPoints,
      },
    });

    return {
      inflectionPoints: results.inflectionPoints,
      parameters: results.parameters,
      markers: results.markers,
    };
  },
};
