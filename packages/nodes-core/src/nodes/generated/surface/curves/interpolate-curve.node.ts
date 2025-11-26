import type { NodeDefinition } from '@sim4d/types';

interface InterpolateCurveParams {
  degree: number;
  periodic: boolean;
  tangentStart: [number, number, number];
  tangentEnd: [number, number, number];
}

interface InterpolateCurveInputs {
  points: Array<[number, number, number]>;
}

interface InterpolateCurveOutputs {
  curve: unknown;
}

export const SurfaceCurvesInterpolateCurveNode: NodeDefinition<
  InterpolateCurveInputs,
  InterpolateCurveOutputs,
  InterpolateCurveParams
> = {
  id: 'Surface::InterpolateCurve',
  category: 'Surface',
  label: 'InterpolateCurve',
  description: 'Interpolate curve through points',
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
    periodic: {
      type: 'boolean',
      label: 'Periodic',
      default: false,
    },
    tangentStart: {
      type: 'vec3',
      label: 'Tangent Start',
      default: null,
    },
    tangentEnd: {
      type: 'vec3',
      label: 'Tangent End',
      default: null,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'interpolateCurve',
      params: {
        points: inputs.points,
        degree: params.degree,
        periodic: params.periodic,
        tangentStart: params.tangentStart,
        tangentEnd: params.tangentEnd,
      },
    });

    return {
      curve: result,
    };
  },
};
