import type { NodeDefinition } from '@brepflow/types';

interface CurveCurveIntersectionParams {
  tolerance: number;
  extendCurves: boolean;
}

interface CurveCurveIntersectionInputs {
  curve1: unknown;
  curve2: unknown;
}

interface CurveCurveIntersectionOutputs {
  intersectionPoints: Array<[number, number, number]>;
  parameters1: unknown;
  parameters2: unknown;
}

export const AnalysisIntersectionCurveCurveIntersectionNode: NodeDefinition<
  CurveCurveIntersectionInputs,
  CurveCurveIntersectionOutputs,
  CurveCurveIntersectionParams
> = {
  id: 'Analysis::CurveCurveIntersection',
  type: 'Analysis::CurveCurveIntersection',
  category: 'Analysis',
  label: 'CurveCurveIntersection',
  description: 'Find curve-curve intersections',
  inputs: {
    curve1: {
      type: 'Wire',
      label: 'Curve1',
      required: true,
    },
    curve2: {
      type: 'Wire',
      label: 'Curve2',
      required: true,
    },
  },
  outputs: {
    intersectionPoints: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
    parameters1: {
      type: 'number[]',
      label: 'Parameters1',
    },
    parameters2: {
      type: 'number[]',
      label: 'Parameters2',
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
    extendCurves: {
      type: 'boolean',
      label: 'Extend Curves',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveCurveIntersection',
      params: {
        curve1: inputs.curve1,
        curve2: inputs.curve2,
        tolerance: params.tolerance,
        extendCurves: params.extendCurves,
      },
    });

    return {
      intersectionPoints: results.intersectionPoints,
      parameters1: results.parameters1,
      parameters2: results.parameters2,
    };
  },
};
