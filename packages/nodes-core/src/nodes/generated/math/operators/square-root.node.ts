import type { NodeDefinition } from '@sim4d/types';

type SquareRootParams = Record<string, never>;

interface SquareRootInputs {
  value: unknown;
}

interface SquareRootOutputs {
  result: unknown;
}

export const MathOperatorsSquareRootNode: NodeDefinition<
  SquareRootInputs,
  SquareRootOutputs,
  SquareRootParams
> = {
  id: 'Math::SquareRoot',
  category: 'Math',
  label: 'SquareRoot',
  description: 'Square root',
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
      type: 'mathSqrt',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
