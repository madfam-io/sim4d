import type { NodeDefinition } from '@sim4d/types';

type MatrixTransformParams = Record<string, never>;

interface MatrixTransformInputs {
  shape: unknown;
  matrix: unknown;
}

interface MatrixTransformOutputs {
  transformed: unknown;
}

export const TransformMatrixTransformNode: NodeDefinition<
  MatrixTransformInputs,
  MatrixTransformOutputs,
  MatrixTransformParams
> = {
  id: 'Transform::MatrixTransform',
  category: 'Transform',
  label: 'MatrixTransform',
  description: 'Apply transformation matrix',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    matrix: {
      type: 'Matrix4x4',
      label: 'Matrix',
      required: true,
    },
  },
  outputs: {
    transformed: {
      type: 'Shape',
      label: 'Transformed',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformMatrix',
      params: {
        shape: inputs.shape,
        matrix: inputs.matrix,
      },
    });

    return {
      transformed: result,
    };
  },
};
