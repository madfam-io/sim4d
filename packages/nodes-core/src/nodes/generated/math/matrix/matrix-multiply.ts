import type { NodeDefinition } from '@brepflow/types';

type MatrixMultiplyParams = Record<string, never>;

interface MatrixMultiplyInputs {
  a: unknown;
  b: unknown;
}

interface MatrixMultiplyOutputs {
  result: unknown;
}

export const MathMatrixMatrixMultiplyNode: NodeDefinition<
  MatrixMultiplyInputs,
  MatrixMultiplyOutputs,
  MatrixMultiplyParams
> = {
  id: 'Math::MatrixMultiply',
  type: 'Math::MatrixMultiply',
  category: 'Math',
  label: 'MatrixMultiply',
  description: 'Matrix multiplication',
  inputs: {
    a: {
      type: 'Matrix',
      label: 'A',
      required: true,
    },
    b: {
      type: 'Matrix',
      label: 'B',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Matrix',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMatrixMultiply',
      params: {
        a: inputs.a,
        b: inputs.b,
      },
    });

    return {
      result: result,
    };
  },
};
