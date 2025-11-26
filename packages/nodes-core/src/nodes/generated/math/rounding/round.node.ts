import type { NodeDefinition } from '@sim4d/types';

type RoundParams = Record<string, never>;

interface RoundInputs {
  value: unknown;
}

interface RoundOutputs {
  result: unknown;
}

export const MathRoundingRoundNode: NodeDefinition<RoundInputs, RoundOutputs, RoundParams> = {
  id: 'Math::Round',
  category: 'Math',
  label: 'Round',
  description: 'Round to nearest integer',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
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
      type: 'mathRound',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
