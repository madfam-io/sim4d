import type { NodeDefinition } from '@sim4d/types';

type FieldCurlParams = Record<string, never>;

interface FieldCurlInputs {
  field: unknown;
}

interface FieldCurlOutputs {
  curl: unknown;
}

export const FieldOperationsFieldCurlNode: NodeDefinition<
  FieldCurlInputs,
  FieldCurlOutputs,
  FieldCurlParams
> = {
  id: 'Field::FieldCurl',
  type: 'Field::FieldCurl',
  category: 'Field',
  label: 'FieldCurl',
  description: 'Compute curl',
  inputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    curl: {
      type: 'VectorField',
      label: 'Curl',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldCurl',
      params: {
        field: inputs.field,
      },
    });

    return {
      curl: result,
    };
  },
};
