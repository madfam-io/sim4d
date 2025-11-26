import type { NodeDefinition } from '@sim4d/types';

interface CurveExtremePointsParams {
  axis: string;
  markPoints: boolean;
}

interface CurveExtremePointsInputs {
  curve: unknown;
}

interface CurveExtremePointsOutputs {
  minPoints: Array<[number, number, number]>;
  maxPoints: Array<[number, number, number]>;
  extremeValues: unknown;
}

export const AnalysisCurvesCurveExtremePointsNode: NodeDefinition<
  CurveExtremePointsInputs,
  CurveExtremePointsOutputs,
  CurveExtremePointsParams
> = {
  id: 'Analysis::CurveExtremePoints',
  type: 'Analysis::CurveExtremePoints',
  category: 'Analysis',
  label: 'CurveExtremePoints',
  description: 'Find extreme points (min/max X,Y,Z)',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    minPoints: {
      type: 'Point[]',
      label: 'Min Points',
    },
    maxPoints: {
      type: 'Point[]',
      label: 'Max Points',
    },
    extremeValues: {
      type: 'number[]',
      label: 'Extreme Values',
    },
  },
  params: {
    axis: {
      type: 'enum',
      label: 'Axis',
      default: 'all',
      options: ['X', 'Y', 'Z', 'all'],
    },
    markPoints: {
      type: 'boolean',
      label: 'Mark Points',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveExtremePoints',
      params: {
        curve: inputs.curve,
        axis: params.axis,
        markPoints: params.markPoints,
      },
    });

    return {
      minPoints: results.minPoints,
      maxPoints: results.maxPoints,
      extremeValues: results.extremeValues,
    };
  },
};
