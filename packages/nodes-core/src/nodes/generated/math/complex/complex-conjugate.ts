import type { NodeDefinition } from '@brepflow/types';

type ComplexConjugateParams = Record<string, never>;

interface ComplexConjugateInputs {
  complex: unknown;
}

interface ComplexConjugateOutputs {
  conjugate: unknown;
}

export const MathComplexComplexConjugateNode: NodeDefinition<
  ComplexConjugateInputs,
  ComplexConjugateOutputs,
  ComplexConjugateParams
> = {
  id: 'Math::ComplexConjugate',
  type: 'Math::ComplexConjugate',
  category: 'Math',
  label: 'ComplexConjugate',
  description: 'Complex conjugate',
  inputs: {
    complex: {
      type: 'Complex',
      label: 'Complex',
      required: true,
    },
  },
  outputs: {
    conjugate: {
      type: 'Complex',
      label: 'Conjugate',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathComplexConjugate',
      params: {
        complex: inputs.complex,
      },
    });

    return {
      conjugate: result,
    };
  },
};
