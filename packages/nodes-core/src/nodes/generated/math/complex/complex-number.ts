import type { NodeDefinition } from '@sim4d/types';

type ComplexNumberParams = Record<string, never>;

interface ComplexNumberInputs {
  real: unknown;
  imaginary: unknown;
}

interface ComplexNumberOutputs {
  complex: unknown;
}

export const MathComplexComplexNumberNode: NodeDefinition<
  ComplexNumberInputs,
  ComplexNumberOutputs,
  ComplexNumberParams
> = {
  id: 'Math::ComplexNumber',
  type: 'Math::ComplexNumber',
  category: 'Math',
  label: 'ComplexNumber',
  description: 'Create complex number',
  inputs: {
    real: {
      type: 'number',
      label: 'Real',
      required: true,
    },
    imaginary: {
      type: 'number',
      label: 'Imaginary',
      required: true,
    },
  },
  outputs: {
    complex: {
      type: 'Complex',
      label: 'Complex',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathComplex',
      params: {
        real: inputs.real,
        imaginary: inputs.imaginary,
      },
    });

    return {
      complex: result,
    };
  },
};
