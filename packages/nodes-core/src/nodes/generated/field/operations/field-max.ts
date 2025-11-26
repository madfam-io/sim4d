import type { NodeDefinition } from '@sim4d/types';

type FieldMaxParams = Record<string, never>;

interface FieldMaxInputs {
  fields: unknown;
}

interface FieldMaxOutputs {
  field: unknown;
}

export const FieldOperationsFieldMaxNode: NodeDefinition<
  FieldMaxInputs,
  FieldMaxOutputs,
  FieldMaxParams
> = {
  id: 'Field::FieldMax',
  type: 'Field::FieldMax',
  category: 'Field',
  label: 'FieldMax',
  description: 'Maximum of fields',
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
      type: 'fieldMax',
      params: {
        fields: inputs.fields,
      },
    });

    return {
      field: result,
    };
  },
};
