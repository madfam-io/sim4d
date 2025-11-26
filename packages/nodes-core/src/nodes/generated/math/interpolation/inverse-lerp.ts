import type { NodeDefinition } from '@sim4d/types';

type InverseLerpParams = Record<string, never>;

interface InverseLerpInputs {
  a: unknown;
  b: unknown;
  value: unknown;
}

interface InverseLerpOutputs {
  t: unknown;
}

export const MathInterpolationInverseLerpNode: NodeDefinition<
  InverseLerpInputs,
  InverseLerpOutputs,
  InverseLerpParams
> = {
  id: 'Math::InverseLerp',
  type: 'Math::InverseLerp',
  category: 'Math',
  label: 'InverseLerp',
  description: 'Inverse linear interpolation',
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
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
  },
  outputs: {
    t: {
      type: 'number',
      label: 'T',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathInverseLerp',
      params: {
        a: inputs.a,
        b: inputs.b,
        value: inputs.value,
      },
    });

    return {
      t: result,
    };
  },
};
