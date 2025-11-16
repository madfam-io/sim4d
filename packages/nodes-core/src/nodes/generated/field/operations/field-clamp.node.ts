import type { NodeDefinition } from '@brepflow/types';

interface FieldClampParams {
  min: number;
  max: number;
}

interface FieldClampInputs {
  field: unknown;
}

interface FieldClampOutputs {
  clamped: unknown;
}

export const FieldOperationsFieldClampNode: NodeDefinition<
  FieldClampInputs,
  FieldClampOutputs,
  FieldClampParams
> = {
  id: 'Field::FieldClamp',
  category: 'Field',
  label: 'FieldClamp',
  description: 'Clamp field values',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    clamped: {
      type: 'ScalarField',
      label: 'Clamped',
    },
  },
  params: {
    min: {
      type: 'number',
      label: 'Min',
      default: 0,
    },
    max: {
      type: 'number',
      label: 'Max',
      default: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldClamp',
      params: {
        field: inputs.field,
        min: params.min,
        max: params.max,
      },
    });

    return {
      clamped: result,
    };
  },
};
