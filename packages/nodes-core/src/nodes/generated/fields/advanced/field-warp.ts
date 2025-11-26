import type { NodeDefinition } from '@sim4d/types';

interface FieldWarpParams {
  strength: number;
}

interface FieldWarpInputs {
  field?: unknown;
  deformation: unknown;
}

interface FieldWarpOutputs {
  warpedField: unknown;
}

export const FieldsAdvancedFieldWarpNode: NodeDefinition<
  FieldWarpInputs,
  FieldWarpOutputs,
  FieldWarpParams
> = {
  id: 'Fields::FieldWarp',
  type: 'Fields::FieldWarp',
  category: 'Fields',
  label: 'FieldWarp',
  description: 'Warp field with deformation',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    deformation: {
      type: 'VectorField',
      label: 'Deformation',
      required: true,
    },
  },
  outputs: {
    warpedField: {
      type: 'Field',
      label: 'Warped Field',
    },
  },
  params: {
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: 0,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'warpField',
      params: {
        field: inputs.field,
        deformation: inputs.deformation,
        strength: params.strength,
      },
    });

    return {
      warpedField: result,
    };
  },
};
