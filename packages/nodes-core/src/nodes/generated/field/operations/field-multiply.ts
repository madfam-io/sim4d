import type { NodeDefinition } from '@sim4d/types';

type FieldMultiplyParams = Record<string, never>;

interface FieldMultiplyInputs {
  fieldA: unknown;
  fieldB: unknown;
}

interface FieldMultiplyOutputs {
  field: unknown;
}

export const FieldOperationsFieldMultiplyNode: NodeDefinition<
  FieldMultiplyInputs,
  FieldMultiplyOutputs,
  FieldMultiplyParams
> = {
  id: 'Field::FieldMultiply',
  type: 'Field::FieldMultiply',
  category: 'Field',
  label: 'FieldMultiply',
  description: 'Multiply fields',
  inputs: {
    fieldA: {
      type: 'ScalarField',
      label: 'Field A',
      required: true,
    },
    fieldB: {
      type: 'ScalarField',
      label: 'Field B',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldMultiply',
      params: {
        fieldA: inputs.fieldA,
        fieldB: inputs.fieldB,
      },
    });

    return {
      field: result,
    };
  },
};
