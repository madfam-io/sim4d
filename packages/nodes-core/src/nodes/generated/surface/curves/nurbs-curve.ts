import type { NodeDefinition } from '@sim4d/types';

interface NurbsCurveParams {
  degree: number;
  periodic: boolean;
}

interface NurbsCurveInputs {
  controlPoints: Array<[number, number, number]>;
  weights?: unknown;
  knots?: unknown;
}

interface NurbsCurveOutputs {
  curve: unknown;
}

export const SurfaceCurvesNurbsCurveNode: NodeDefinition<
  NurbsCurveInputs,
  NurbsCurveOutputs,
  NurbsCurveParams
> = {
  id: 'Surface::NurbsCurve',
  type: 'Surface::NurbsCurve',
  category: 'Surface',
  label: 'NurbsCurve',
  description: 'Create NURBS curve',
  inputs: {
    controlPoints: {
      type: 'Point[]',
      label: 'Control Points',
      required: true,
    },
    weights: {
      type: 'number[]',
      label: 'Weights',
      optional: true,
    },
    knots: {
      type: 'number[]',
      label: 'Knots',
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
      step: 1,
    },
    periodic: {
      type: 'boolean',
      label: 'Periodic',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'nurbsCurve',
      params: {
        controlPoints: inputs.controlPoints,
        weights: inputs.weights,
        knots: inputs.knots,
        degree: params.degree,
        periodic: params.periodic,
      },
    });

    return {
      curve: result,
    };
  },
};
