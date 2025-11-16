import type { NodeDefinition } from '@brepflow/types';

type MultiplyParams = Record<string, never>;

interface MultiplyInputs {
  a: unknown;
  b: unknown;
}

interface MultiplyOutputs {
  result: unknown;
}

export const MathOperatorsMultiplyNode: NodeDefinition<
  MultiplyInputs,
  MultiplyOutputs,
  MultiplyParams
> = {
  id: 'Math::Multiply',
  type: 'Math::Multiply',
  category: 'Math',
  label: 'Multiply',
  description: 'Multiply numbers',
  inputs: {
    a: {
      type: 'number',
      label: 'A',
      required: true,
    },
    b: {
      type: 'number',
      label: 'B',
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
      type: 'mathMultiply',
      params: {
        a: inputs.a,
        b: inputs.b,
      },
    });

    return {
      result: result,
    };
  },
};
