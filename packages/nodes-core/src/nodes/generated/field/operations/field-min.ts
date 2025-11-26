import type { NodeDefinition } from '@sim4d/types';

type FieldMinParams = Record<string, never>;

interface FieldMinInputs {
  fields: unknown;
}

interface FieldMinOutputs {
  field: unknown;
}

export const FieldOperationsFieldMinNode: NodeDefinition<
  FieldMinInputs,
  FieldMinOutputs,
  FieldMinParams
> = {
  id: 'Field::FieldMin',
  type: 'Field::FieldMin',
  category: 'Field',
  label: 'FieldMin',
  description: 'Minimum of fields',
  inputs: {
    fields: {
      type: 'ScalarField[]',
      label: 'Fields',
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
      type: 'fieldMin',
      params: {
        fields: inputs.fields,
      },
    });

    return {
      field: result,
    };
  },
};
