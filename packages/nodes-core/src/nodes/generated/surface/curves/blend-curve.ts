import type { NodeDefinition } from '@brepflow/types';

interface BlendCurveParams {
  continuityStart: string;
  continuityEnd: string;
  bulge: number;
}

interface BlendCurveInputs {
  curve1: unknown;
  curve2: unknown;
  point1?: [number, number, number];
  point2?: [number, number, number];
}

interface BlendCurveOutputs {
  blendCurve: unknown;
}

export const SurfaceCurvesBlendCurveNode: NodeDefinition<
  BlendCurveInputs,
  BlendCurveOutputs,
  BlendCurveParams
> = {
  id: 'Surface::BlendCurve',
  type: 'Surface::BlendCurve',
  category: 'Surface',
  label: 'BlendCurve',
  description: 'Blend between two curves',
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
    point1: {
      type: 'Point',
      label: 'Point1',
      optional: true,
    },
    point2: {
      type: 'Point',
      label: 'Point2',
      optional: true,
    },
  },
  outputs: {
    blendCurve: {
      type: 'Wire',
      label: 'Blend Curve',
    },
  },
  params: {
    continuityStart: {
      type: 'enum',
      label: 'Continuity Start',
      default: 'G1',
      options: ['G0', 'G1', 'G2', 'G3'],
    },
    continuityEnd: {
      type: 'enum',
      label: 'Continuity End',
      default: 'G1',
      options: ['G0', 'G1', 'G2', 'G3'],
    },
    bulge: {
      type: 'number',
      label: 'Bulge',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'blendCurve',
      params: {
        curve1: inputs.curve1,
        curve2: inputs.curve2,
        point1: inputs.point1,
        point2: inputs.point2,
        continuityStart: params.continuityStart,
        continuityEnd: params.continuityEnd,
        bulge: params.bulge,
      },
    });

    return {
      blendCurve: result,
    };
  },
};
