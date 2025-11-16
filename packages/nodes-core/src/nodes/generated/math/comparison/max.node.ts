import type { NodeDefinition } from '@brepflow/types';

type MaxParams = Record<string, never>;

interface MaxInputs {
  values: unknown;
}

interface MaxOutputs {
  max: unknown;
}

export const MathComparisonMaxNode: NodeDefinition<MaxInputs, MaxOutputs, MaxParams> = {
  id: 'Math::Max',
  category: 'Math',
  label: 'Max',
  description: 'Maximum value',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    max: {
      type: 'number',
      label: 'Max',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMax',
      params: {
        values: inputs.values,
      },
    });

    return {
      max: result,
    };
  },
};
