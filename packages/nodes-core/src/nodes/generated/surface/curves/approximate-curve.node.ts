import type { NodeDefinition } from '@sim4d/types';

interface ApproximateCurveParams {
  degree: number;
  tolerance: number;
  smoothness: number;
}

interface ApproximateCurveInputs {
  points: Array<[number, number, number]>;
}

interface ApproximateCurveOutputs {
  curve: unknown;
}

export const SurfaceCurvesApproximateCurveNode: NodeDefinition<
  ApproximateCurveInputs,
  ApproximateCurveOutputs,
  ApproximateCurveParams
> = {
  id: 'Surface::ApproximateCurve',
  category: 'Surface',
  label: 'ApproximateCurve',
  description: 'Approximate points with curve',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
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
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    smoothness: {
      type: 'number',
      label: 'Smoothness',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'approximateCurve',
      params: {
        points: inputs.points,
        degree: params.degree,
        tolerance: params.tolerance,
        smoothness: params.smoothness,
      },
    });

    return {
      curve: result,
    };
  },
};
