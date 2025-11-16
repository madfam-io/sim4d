import type { NodeDefinition } from '@brepflow/types';

type FieldGradientParams = Record<string, never>;

interface FieldGradientInputs {
  field: unknown;
}

interface FieldGradientOutputs {
  gradient: unknown;
}

export const FieldOperationsFieldGradientNode: NodeDefinition<
  FieldGradientInputs,
  FieldGradientOutputs,
  FieldGradientParams
> = {
  id: 'Field::FieldGradient',
  category: 'Field',
  label: 'FieldGradient',
  description: 'Compute field gradient',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    gradient: {
      type: 'VectorField',
      label: 'Gradient',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldGradient',
      params: {
        field: inputs.field,
      },
    });

    return {
      gradient: result,
    };
  },
};
