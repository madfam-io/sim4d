import type { NodeDefinition } from '@brepflow/types';

type ComplexAddParams = Record<string, never>;

interface ComplexAddInputs {
  a: unknown;
  b: unknown;
}

interface ComplexAddOutputs {
  result: unknown;
}

export const MathComplexComplexAddNode: NodeDefinition<
  ComplexAddInputs,
  ComplexAddOutputs,
  ComplexAddParams
> = {
  id: 'Math::ComplexAdd',
  category: 'Math',
  label: 'ComplexAdd',
  description: 'Add complex numbers',
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
      type: 'mathComplexAdd',
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
