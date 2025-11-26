import type { NodeDefinition } from '@sim4d/types';

interface SplineParams {
  degree: number;
  closed: boolean;
  smooth: boolean;
}

interface SplineInputs {
  points: Array<[number, number, number]>;
  tangents?: Array<[number, number, number]>;
}

interface SplineOutputs {
  curve: unknown;
}

export const SketchCurvesSplineNode: NodeDefinition<SplineInputs, SplineOutputs, SplineParams> = {
  id: 'Sketch::Spline',
  category: 'Sketch',
  label: 'Spline',
  description: 'Create a spline curve through points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    tangents: {
      type: 'Vector[]',
      label: 'Tangents',
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
    closed: {
      type: 'boolean',
      label: 'Closed',
      default: false,
    },
    smooth: {
      type: 'boolean',
      label: 'Smooth',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeSpline',
      params: {
        points: inputs.points,
        tangents: inputs.tangents,
        degree: params.degree,
        closed: params.closed,
        smooth: params.smooth,
      },
    });

    return {
      curve: result,
    };
  },
};
