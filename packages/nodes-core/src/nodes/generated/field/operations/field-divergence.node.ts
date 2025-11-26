import type { NodeDefinition } from '@sim4d/types';

type FieldDivergenceParams = Record<string, never>;

interface FieldDivergenceInputs {
  field: unknown;
}

interface FieldDivergenceOutputs {
  divergence: unknown;
}

export const FieldOperationsFieldDivergenceNode: NodeDefinition<
  FieldDivergenceInputs,
  FieldDivergenceOutputs,
  FieldDivergenceParams
> = {
  id: 'Field::FieldDivergence',
  category: 'Field',
  label: 'FieldDivergence',
  description: 'Compute divergence',
  inputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    divergence: {
      type: 'ScalarField',
      label: 'Divergence',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldDivergence',
      params: {
        field: inputs.field,
      },
    });

    return {
      divergence: result,
    };
  },
};
