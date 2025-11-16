import type { NodeDefinition } from '@brepflow/types';

interface FieldDivideParams {
  epsilon: number;
}

interface FieldDivideInputs {
  fieldA: unknown;
  fieldB: unknown;
}

interface FieldDivideOutputs {
  field: unknown;
}

export const FieldOperationsFieldDivideNode: NodeDefinition<
  FieldDivideInputs,
  FieldDivideOutputs,
  FieldDivideParams
> = {
  id: 'Field::FieldDivide',
  type: 'Field::FieldDivide',
  category: 'Field',
  label: 'FieldDivide',
  description: 'Divide fields',
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
  params: {
    epsilon: {
      type: 'number',
      label: 'Epsilon',
      default: 0.001,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldDivide',
      params: {
        fieldA: inputs.fieldA,
        fieldB: inputs.fieldB,
        epsilon: params.epsilon,
      },
    });

    return {
      field: result,
    };
  },
};
