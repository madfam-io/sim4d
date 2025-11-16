import type { NodeDefinition } from '@brepflow/types';

type FieldSubtractParams = Record<string, never>;

interface FieldSubtractInputs {
  fieldA: unknown;
  fieldB: unknown;
}

interface FieldSubtractOutputs {
  field: unknown;
}

export const FieldOperationsFieldSubtractNode: NodeDefinition<
  FieldSubtractInputs,
  FieldSubtractOutputs,
  FieldSubtractParams
> = {
  id: 'Field::FieldSubtract',
  category: 'Field',
  label: 'FieldSubtract',
  description: 'Subtract fields',
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
      type: 'fieldSubtract',
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
