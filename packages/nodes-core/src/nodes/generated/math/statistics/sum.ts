import type { NodeDefinition } from '@sim4d/types';

type SumParams = Record<string, never>;

interface SumInputs {
  values: unknown;
}

interface SumOutputs {
  sum: unknown;
}

export const MathStatisticsSumNode: NodeDefinition<SumInputs, SumOutputs, SumParams> = {
  id: 'Math::Sum',
  type: 'Math::Sum',
  category: 'Math',
  label: 'Sum',
  description: 'Sum of values',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    sum: {
      type: 'number',
      label: 'Sum',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathSum',
      params: {
        values: inputs.values,
      },
    });

    return {
      sum: result,
    };
  },
};
