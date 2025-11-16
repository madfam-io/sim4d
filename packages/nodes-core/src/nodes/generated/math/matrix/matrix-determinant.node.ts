import type { NodeDefinition } from '@brepflow/types';

type MatrixDeterminantParams = Record<string, never>;

interface MatrixDeterminantInputs {
  matrix: unknown;
}

interface MatrixDeterminantOutputs {
  determinant: unknown;
}

export const MathMatrixMatrixDeterminantNode: NodeDefinition<
  MatrixDeterminantInputs,
  MatrixDeterminantOutputs,
  MatrixDeterminantParams
> = {
  id: 'Math::MatrixDeterminant',
  category: 'Math',
  label: 'MatrixDeterminant',
  description: 'Matrix determinant',
  inputs: {
    matrix: {
      type: 'Matrix',
      label: 'Matrix',
      required: true,
    },
  },
  outputs: {
    determinant: {
      type: 'number',
      label: 'Determinant',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMatrixDeterminant',
      params: {
        matrix: inputs.matrix,
      },
    });

    return {
      determinant: result,
    };
  },
};
