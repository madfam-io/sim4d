import type { NodeDefinition } from '@sim4d/types';

type MatrixTransposeParams = Record<string, never>;

interface MatrixTransposeInputs {
  matrix: unknown;
}

interface MatrixTransposeOutputs {
  transpose: unknown;
}

export const MathMatrixMatrixTransposeNode: NodeDefinition<
  MatrixTransposeInputs,
  MatrixTransposeOutputs,
  MatrixTransposeParams
> = {
  id: 'Math::MatrixTranspose',
  category: 'Math',
  label: 'MatrixTranspose',
  description: 'Matrix transpose',
  inputs: {
    matrix: {
      type: 'Matrix',
      label: 'Matrix',
      required: true,
    },
  },
  outputs: {
    transpose: {
      type: 'Matrix',
      label: 'Transpose',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMatrixTranspose',
      params: {
        matrix: inputs.matrix,
      },
    });

    return {
      transpose: result,
    };
  },
};
