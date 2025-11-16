import type { NodeDefinition } from '@brepflow/types';

type NegateParams = Record<string, never>;

interface NegateInputs {
  value: unknown;
}

interface NegateOutputs {
  result: unknown;
}

export const MathOperatorsNegateNode: NodeDefinition<NegateInputs, NegateOutputs, NegateParams> = {
  id: 'Math::Negate',
  type: 'Math::Negate',
  category: 'Math',
  label: 'Negate',
  description: 'Negate value',
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
      type: 'mathNegate',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
