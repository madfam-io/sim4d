import type { NodeDefinition } from '@sim4d/types';

type ComplexMultiplyParams = Record<string, never>;

interface ComplexMultiplyInputs {
  a: unknown;
  b: unknown;
}

interface ComplexMultiplyOutputs {
  result: unknown;
}

export const MathComplexComplexMultiplyNode: NodeDefinition<
  ComplexMultiplyInputs,
  ComplexMultiplyOutputs,
  ComplexMultiplyParams
> = {
  id: 'Math::ComplexMultiply',
  type: 'Math::ComplexMultiply',
  category: 'Math',
  label: 'ComplexMultiply',
  description: 'Multiply complex numbers',
  inputs: {
    a: {
      type: 'Complex',
      label: 'A',
      required: true,
    },
    b: {
      type: 'Complex',
      label: 'B',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Complex',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathComplexMultiply',
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
