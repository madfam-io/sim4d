import type { NodeDefinition } from '@sim4d/types';

type SignParams = Record<string, never>;

interface SignInputs {
  value: unknown;
}

interface SignOutputs {
  sign: unknown;
}

export const MathComparisonSignNode: NodeDefinition<SignInputs, SignOutputs, SignParams> = {
  id: 'Math::Sign',
  type: 'Math::Sign',
  category: 'Math',
  label: 'Sign',
  description: 'Sign of number',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
  },
  outputs: {
    sign: {
      type: 'number',
      label: 'Sign',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathSign',
      params: {
        value: inputs.value,
      },
    });

    return {
      sign: result,
    };
  },
};
