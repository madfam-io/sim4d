import type { NodeDefinition } from '@brepflow/types';

interface FieldBlendParams {
  mode: string;
}

interface FieldBlendInputs {
  fieldA: unknown;
  fieldB: unknown;
  factor: unknown;
}

interface FieldBlendOutputs {
  field: unknown;
}

export const FieldOperationsFieldBlendNode: NodeDefinition<
  FieldBlendInputs,
  FieldBlendOutputs,
  FieldBlendParams
> = {
  id: 'Field::FieldBlend',
  category: 'Field',
  label: 'FieldBlend',
  description: 'Blend fields',
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
    factor: {
      type: 'number',
      label: 'Factor',
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
    mode: {
      type: 'enum',
      label: 'Mode',
      default: 'linear',
      options: ['linear', 'smooth', 'overlay', 'multiply'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldBlend',
      params: {
        fieldA: inputs.fieldA,
        fieldB: inputs.fieldB,
        factor: inputs.factor,
        mode: params.mode,
      },
    });

    return {
      field: result,
    };
  },
};
