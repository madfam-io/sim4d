import type { NodeDefinition } from '@sim4d/types';

type TruncateParams = Record<string, never>;

interface TruncateInputs {
  value: unknown;
}

interface TruncateOutputs {
  result: unknown;
}

export const MathRoundingTruncateNode: NodeDefinition<
  TruncateInputs,
  TruncateOutputs,
  TruncateParams
> = {
  id: 'Math::Truncate',
  type: 'Math::Truncate',
  category: 'Math',
  label: 'Truncate',
  description: 'Remove decimal part',
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
      type: 'mathTrunc',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
