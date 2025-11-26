import type { NodeDefinition } from '@sim4d/types';

type AbsoluteParams = Record<string, never>;

interface AbsoluteInputs {
  value: unknown;
}

interface AbsoluteOutputs {
  result: unknown;
}

export const MathOperatorsAbsoluteNode: NodeDefinition<
  AbsoluteInputs,
  AbsoluteOutputs,
  AbsoluteParams
> = {
  id: 'Math::Absolute',
  category: 'Math',
  label: 'Absolute',
  description: 'Absolute value',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
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
      type: 'mathAbs',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
