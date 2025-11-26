import type { NodeDefinition } from '@sim4d/types';

type MinParams = Record<string, never>;

interface MinInputs {
  values: unknown;
}

interface MinOutputs {
  min: unknown;
}

export const MathComparisonMinNode: NodeDefinition<MinInputs, MinOutputs, MinParams> = {
  id: 'Math::Min',
  category: 'Math',
  label: 'Min',
  description: 'Minimum value',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    min: {
      type: 'number',
      label: 'Min',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMin',
      params: {
        values: inputs.values,
      },
    });

    return {
      min: result,
    };
  },
};
