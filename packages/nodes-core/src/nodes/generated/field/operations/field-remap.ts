import type { NodeDefinition } from '@sim4d/types';

interface FieldRemapParams {
  fromMin: number;
  fromMax: number;
  toMin: number;
  toMax: number;
}

interface FieldRemapInputs {
  field: unknown;
}

interface FieldRemapOutputs {
  remapped: unknown;
}

export const FieldOperationsFieldRemapNode: NodeDefinition<
  FieldRemapInputs,
  FieldRemapOutputs,
  FieldRemapParams
> = {
  id: 'Field::FieldRemap',
  type: 'Field::FieldRemap',
  category: 'Field',
  label: 'FieldRemap',
  description: 'Remap field values',
  inputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    remapped: {
      type: 'ScalarField',
      label: 'Remapped',
    },
  },
  params: {
    fromMin: {
      type: 'number',
      label: 'From Min',
      default: 0,
    },
    fromMax: {
      type: 'number',
      label: 'From Max',
      default: 1,
    },
    toMin: {
      type: 'number',
      label: 'To Min',
      default: 0,
    },
    toMax: {
      type: 'number',
      label: 'To Max',
      default: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldRemap',
      params: {
        field: inputs.field,
        fromMin: params.fromMin,
        fromMax: params.fromMax,
        toMin: params.toMin,
        toMax: params.toMax,
      },
    });

    return {
      remapped: result,
    };
  },
};
