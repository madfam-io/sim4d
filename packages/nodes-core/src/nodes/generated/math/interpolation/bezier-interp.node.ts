import type { NodeDefinition } from '@brepflow/types';

type BezierInterpParams = Record<string, never>;

interface BezierInterpInputs {
  points: unknown;
  t: unknown;
}

interface BezierInterpOutputs {
  result: unknown;
}

export const MathInterpolationBezierInterpNode: NodeDefinition<
  BezierInterpInputs,
  BezierInterpOutputs,
  BezierInterpParams
> = {
  id: 'Math::BezierInterp',
  category: 'Math',
  label: 'BezierInterp',
  description: 'Bezier interpolation',
  inputs: {
    points: {
      type: 'number[]',
      label: 'Points',
      required: true,
    },
    t: {
      type: 'number',
      label: 'T',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathBezierInterp',
      params: {
        points: inputs.points,
        t: inputs.t,
      },
    });

    return {
      result: result,
    };
  },
};
