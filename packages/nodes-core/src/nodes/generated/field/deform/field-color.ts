import type { NodeDefinition } from '@brepflow/types';

interface FieldColorParams {
  gradient: string;
}

interface FieldColorInputs {
  mesh: unknown;
  field: unknown;
}

interface FieldColorOutputs {
  coloredMesh: unknown;
}

export const FieldDeformFieldColorNode: NodeDefinition<
  FieldColorInputs,
  FieldColorOutputs,
  FieldColorParams
> = {
  id: 'Field::FieldColor',
  type: 'Field::FieldColor',
  category: 'Field',
  label: 'FieldColor',
  description: 'Color by field value',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    field: {
      type: 'ScalarField',
      label: 'Field',
      required: true,
    },
  },
  outputs: {
    coloredMesh: {
      type: 'Mesh',
      label: 'Colored Mesh',
    },
  },
  params: {
    gradient: {
      type: 'enum',
      label: 'Gradient',
      default: 'rainbow',
      options: ['grayscale', 'rainbow', 'heat', 'cool', 'custom'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldColor',
      params: {
        mesh: inputs.mesh,
        field: inputs.field,
        gradient: params.gradient,
      },
    });

    return {
      coloredMesh: result,
    };
  },
};
