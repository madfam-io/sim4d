import type { NodeDefinition } from '@sim4d/types';

type FieldLaplacianParams = Record<string, never>;

interface FieldLaplacianInputs {
  field: unknown;
}

interface FieldLaplacianOutputs {
  laplacian: unknown;
}

export const FieldOperationsFieldLaplacianNode: NodeDefinition<
  FieldLaplacianInputs,
  FieldLaplacianOutputs,
  FieldLaplacianParams
> = {
  id: 'Field::FieldLaplacian',
  type: 'Field::FieldLaplacian',
  category: 'Field',
  label: 'FieldLaplacian',
  description: 'Compute Laplacian',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    laplacian: {
      type: 'ScalarField',
      label: 'Laplacian',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldLaplacian',
      params: {
        field: inputs.field,
      },
    });

    return {
      laplacian: result,
    };
  },
};
