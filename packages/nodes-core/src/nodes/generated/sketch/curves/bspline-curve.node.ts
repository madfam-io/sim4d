import type { NodeDefinition } from '@brepflow/types';

interface BSplineCurveParams {
  degree: number;
  periodic: boolean;
}

interface BSplineCurveInputs {
  controlPoints: Array<[number, number, number]>;
  knots?: unknown;
  weights?: unknown;
}

interface BSplineCurveOutputs {
  curve: unknown;
}

export const SketchCurvesBSplineCurveNode: NodeDefinition<
  BSplineCurveInputs,
  BSplineCurveOutputs,
  BSplineCurveParams
> = {
  id: 'Sketch::BSplineCurve',
  category: 'Sketch',
  label: 'BSplineCurve',
  description: 'Create a B-Spline curve',
  inputs: {
    controlPoints: {
      type: 'Point[]',
      label: 'Control Points',
      required: true,
    },
    knots: {
      type: 'number[]',
      label: 'Knots',
      optional: true,
    },
    weights: {
      type: 'number[]',
      label: 'Weights',
      optional: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {
    degree: {
      type: 'number',
      label: 'Degree',
      default: 3,
      min: 1,
      max: 10,
    },
    periodic: {
      type: 'boolean',
      label: 'Periodic',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeBSpline',
      params: {
        controlPoints: inputs.controlPoints,
        knots: inputs.knots,
        weights: inputs.weights,
        degree: params.degree,
        periodic: params.periodic,
      },
    });

    return {
      curve: result,
    };
  },
};
