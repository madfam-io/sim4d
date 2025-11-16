import type { NodeDefinition } from '@brepflow/types';

interface FieldDeformParams {
  strength: number;
}

interface FieldDeformInputs {
  geometry: unknown;
  field: unknown;
}

interface FieldDeformOutputs {
  deformed: unknown;
}

export const FieldDeformFieldDeformNode: NodeDefinition<
  FieldDeformInputs,
  FieldDeformOutputs,
  FieldDeformParams
> = {
  id: 'Field::FieldDeform',
  type: 'Field::FieldDeform',
  category: 'Field',
  label: 'FieldDeform',
  description: 'Deform by field',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
    field: {
      type: 'VectorField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    deformed: {
      type: 'Shape',
      label: 'Deformed',
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
      type: 'fieldDeform',
      params: {
        geometry: inputs.geometry,
        field: inputs.field,
        strength: params.strength,
      },
    });

    return {
      deformed: result,
    };
  },
};
