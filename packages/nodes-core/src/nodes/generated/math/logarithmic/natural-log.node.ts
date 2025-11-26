import type { NodeDefinition } from '@sim4d/types';

type NaturalLogParams = Record<string, never>;

interface NaturalLogInputs {
  value: unknown;
}

interface NaturalLogOutputs {
  result: unknown;
}

export const MathLogarithmicNaturalLogNode: NodeDefinition<
  NaturalLogInputs,
  NaturalLogOutputs,
  NaturalLogParams
> = {
  id: 'Math::NaturalLog',
  category: 'Math',
  label: 'NaturalLog',
  description: 'Natural logarithm',
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
      type: 'mathLn',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
