import type { NodeDefinition } from '@brepflow/types';

type MatrixInverseParams = Record<string, never>;

interface MatrixInverseInputs {
  matrix: unknown;
}

interface MatrixInverseOutputs {
  inverse: unknown;
}

export const MathMatrixMatrixInverseNode: NodeDefinition<
  MatrixInverseInputs,
  MatrixInverseOutputs,
  MatrixInverseParams
> = {
  id: 'Math::MatrixInverse',
  category: 'Math',
  label: 'MatrixInverse',
  description: 'Matrix inverse',
  inputs: {
    matrix: {
      type: 'Matrix',
      label: 'Matrix',
      required: true,
    },
  },
  outputs: {
    inverse: {
      type: 'Matrix',
      label: 'Inverse',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMatrixInverse',
      params: {
        matrix: inputs.matrix,
      },
    });

    return {
      inverse: result,
    };
  },
};
