import type { NodeDefinition } from '@brepflow/types';

type LerpParams = Record<string, never>;

interface LerpInputs {
  a: unknown;
  b: unknown;
  t: unknown;
}

interface LerpOutputs {
  result: unknown;
}

export const MathInterpolationLerpNode: NodeDefinition<LerpInputs, LerpOutputs, LerpParams> = {
  id: 'Math::Lerp',
  category: 'Math',
  label: 'Lerp',
  description: 'Linear interpolation',
  inputs: {
    a: {
      type: 'number',
      label: 'A',
      required: true,
    },
    b: {
      type: 'number',
      label: 'B',
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
      type: 'mathLerp',
      params: {
        a: inputs.a,
        b: inputs.b,
        t: inputs.t,
      },
    });

    return {
      result: result,
    };
  },
};
