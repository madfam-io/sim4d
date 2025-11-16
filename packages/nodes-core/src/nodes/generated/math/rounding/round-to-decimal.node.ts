import type { NodeDefinition } from '@brepflow/types';

interface RoundToDecimalParams {
  decimals: number;
}

interface RoundToDecimalInputs {
  value: unknown;
}

interface RoundToDecimalOutputs {
  result: unknown;
}

export const MathRoundingRoundToDecimalNode: NodeDefinition<
  RoundToDecimalInputs,
  RoundToDecimalOutputs,
  RoundToDecimalParams
> = {
  id: 'Math::RoundToDecimal',
  category: 'Math',
  label: 'RoundToDecimal',
  description: 'Round to decimal places',
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
  params: {
    decimals: {
      type: 'number',
      label: 'Decimals',
      default: 2,
      min: 0,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathRoundDecimal',
      params: {
        value: inputs.value,
        decimals: params.decimals,
      },
    });

    return {
      result: result,
    };
  },
};
