import { NodeDefinition } from '@brepflow/types';

interface Params {
  degree: number;
  periodic: boolean;
}
interface Inputs {
  controlPoints: Point[];
  knots?: number[];
  weights?: number[];
}
interface Outputs {
  curve: Wire;
}

export const BSplineCurveNode: NodeDefinition<
  BSplineCurveInputs,
  BSplineCurveOutputs,
  BSplineCurveParams
> = {
  type: 'Sketch::BSplineCurve',
  category: 'Sketch',
  subcategory: 'Curves',

  metadata: {
    label: 'BSplineCurve',
    description: 'Create a B-Spline curve',
  },

  params: {
    degree: {
      default: 3,
      min: 1,
      max: 10,
    },
    periodic: {
      default: false,
    },
  },

  inputs: {
    controlPoints: 'Point[]',
    knots: 'number[]',
    weights: 'number[]',
  },

  outputs: {
    curve: 'Wire',
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
