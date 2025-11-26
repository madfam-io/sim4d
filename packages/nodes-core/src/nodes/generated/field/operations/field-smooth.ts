import type { NodeDefinition } from '@sim4d/types';

interface FieldSmoothParams {
  iterations: number;
  factor: number;
}

interface FieldSmoothInputs {
  field: unknown;
}

interface FieldSmoothOutputs {
  smoothed: unknown;
}

export const FieldOperationsFieldSmoothNode: NodeDefinition<
  FieldSmoothInputs,
  FieldSmoothOutputs,
  FieldSmoothParams
> = {
  id: 'Field::FieldSmooth',
  type: 'Field::FieldSmooth',
  category: 'Field',
  label: 'FieldSmooth',
  description: 'Smooth field',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    smoothed: {
      type: 'ScalarField',
      label: 'Smoothed',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 1,
      max: 10,
      step: 1,
    },
    factor: {
      type: 'number',
      label: 'Factor',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldSmooth',
      params: {
        field: inputs.field,
        iterations: params.iterations,
        factor: params.factor,
      },
    });

    return {
      smoothed: result,
    };
  },
};
