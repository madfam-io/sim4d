import type { NodeDefinition } from '@sim4d/types';

interface FieldRotateParams {
  maxAngle: number;
}

interface FieldRotateInputs {
  geometry: unknown;
  field: unknown;
}

interface FieldRotateOutputs {
  rotated: unknown;
}

export const FieldDeformFieldRotateNode: NodeDefinition<
  FieldRotateInputs,
  FieldRotateOutputs,
  FieldRotateParams
> = {
  id: 'Field::FieldRotate',
  type: 'Field::FieldRotate',
  category: 'Field',
  label: 'FieldRotate',
  description: 'Rotate by field',
  inputs: {
    geometry: {
      type: 'Shape[]',
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
    rotated: {
      type: 'Shape[]',
      label: 'Rotated',
    },
  },
  params: {
    maxAngle: {
      type: 'number',
      label: 'Max Angle',
      default: 180,
      min: -360,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fieldRotate',
      params: {
        geometry: inputs.geometry,
        field: inputs.field,
        maxAngle: params.maxAngle,
      },
    });

    return {
      rotated: result,
    };
  },
};
