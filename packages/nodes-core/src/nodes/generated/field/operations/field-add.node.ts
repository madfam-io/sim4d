import type { NodeDefinition } from '@sim4d/types';

type FieldAddParams = Record<string, never>;

interface FieldAddInputs {
  fieldA: unknown;
  fieldB: unknown;
}

interface FieldAddOutputs {
  field: unknown;
}

export const FieldOperationsFieldAddNode: NodeDefinition<
  FieldAddInputs,
  FieldAddOutputs,
  FieldAddParams
> = {
  id: 'Field::FieldAdd',
  category: 'Field',
  label: 'FieldAdd',
  description: 'Add fields',
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
      type: 'fieldAdd',
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
