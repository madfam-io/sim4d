import type { NodeDefinition } from '@brepflow/types';

type BezierCurveParams = Record<string, never>;

interface BezierCurveInputs {
  controlPoints: Array<[number, number, number]>;
}

interface BezierCurveOutputs {
  curve: unknown;
}

export const SketchCurvesBezierCurveNode: NodeDefinition<
  BezierCurveInputs,
  BezierCurveOutputs,
  BezierCurveParams
> = {
  id: 'Sketch::BezierCurve',
  type: 'Sketch::BezierCurve',
  category: 'Sketch',
  label: 'BezierCurve',
  description: 'Create a Bezier curve',
  inputs: {
    controlPoints: {
      type: 'Point[]',
      label: 'Control Points',
      required: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeBezier',
      params: {
        controlPoints: inputs.controlPoints,
      },
    });

    return {
      curve: result,
    };
  },
};
