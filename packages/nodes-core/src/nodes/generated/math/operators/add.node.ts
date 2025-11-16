import type { NodeDefinition } from '@brepflow/types';

type AddParams = Record<string, never>;

interface AddInputs {
  a: unknown;
  b: unknown;
}

interface AddOutputs {
  result: unknown;
}

export const MathOperatorsAddNode: NodeDefinition<AddInputs, AddOutputs, AddParams> = {
  id: 'Math::Add',
  category: 'Math',
  label: 'Add',
  description: 'Add two numbers',
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
      type: 'mathAdd',
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
