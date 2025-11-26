import type { NodeDefinition } from '@sim4d/types';

interface FieldDisplaceParams {
  strength: number;
}

interface FieldDisplaceInputs {
  surface: unknown;
  field: unknown;
}

interface FieldDisplaceOutputs {
  displaced: unknown;
}

export const FieldDeformFieldDisplaceNode: NodeDefinition<
  FieldDisplaceInputs,
  FieldDisplaceOutputs,
  FieldDisplaceParams
> = {
  id: 'Field::FieldDisplace',
  category: 'Field',
  label: 'FieldDisplace',
  description: 'Displace along normals',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    displaced: {
      type: 'Face',
      label: 'Displaced',
    },
  },
  params: {
    strength: {
      type: 'number',
      label: 'Strength',
      default: 10,
      min: -100,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldDisplace',
      params: {
        surface: inputs.surface,
        field: inputs.field,
        strength: params.strength,
      },
    });

    return {
      displaced: result,
    };
  },
};
