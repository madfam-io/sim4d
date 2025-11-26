import type { NodeDefinition } from '@sim4d/types';

type SubtractParams = Record<string, never>;

interface SubtractInputs {
  a: unknown;
  b: unknown;
}

interface SubtractOutputs {
  result: unknown;
}

export const MathOperatorsSubtractNode: NodeDefinition<
  SubtractInputs,
  SubtractOutputs,
  SubtractParams
> = {
  id: 'Math::Subtract',
  type: 'Math::Subtract',
  category: 'Math',
  label: 'Subtract',
  description: 'Subtract numbers',
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
      type: 'mathSubtract',
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
