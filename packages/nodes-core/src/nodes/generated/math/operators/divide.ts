import type { NodeDefinition } from '@brepflow/types';

type DivideParams = Record<string, never>;

interface DivideInputs {
  a: unknown;
  b: unknown;
}

interface DivideOutputs {
  result: unknown;
}

export const MathOperatorsDivideNode: NodeDefinition<DivideInputs, DivideOutputs, DivideParams> = {
  id: 'Math::Divide',
  type: 'Math::Divide',
  category: 'Math',
  label: 'Divide',
  description: 'Divide numbers',
  inputs: {
    a: {
      type: 'number',
      label: 'A',
      required: true,
    },
    b: {
      type: 'number',
      label: 'B',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathDivide',
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
