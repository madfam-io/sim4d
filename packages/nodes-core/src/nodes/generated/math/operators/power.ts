import type { NodeDefinition } from '@sim4d/types';

type PowerParams = Record<string, never>;

interface PowerInputs {
  base: unknown;
  exponent: unknown;
}

interface PowerOutputs {
  result: unknown;
}

export const MathOperatorsPowerNode: NodeDefinition<PowerInputs, PowerOutputs, PowerParams> = {
  id: 'Math::Power',
  type: 'Math::Power',
  category: 'Math',
  label: 'Power',
  description: 'Raise to power',
  inputs: {
    base: {
      type: 'number',
      label: 'Base',
      required: true,
    },
    exponent: {
      type: 'number',
      label: 'Exponent',
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
      type: 'mathPower',
      params: {
        base: inputs.base,
        exponent: inputs.exponent,
      },
    });

    return {
      result: result,
    };
  },
};
