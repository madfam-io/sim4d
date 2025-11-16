import type { NodeDefinition } from '@brepflow/types';

type Log10Params = Record<string, never>;

interface Log10Inputs {
  value: unknown;
}

interface Log10Outputs {
  result: unknown;
}

export const MathLogarithmicLog10Node: NodeDefinition<Log10Inputs, Log10Outputs, Log10Params> = {
  id: 'Math::Log10',
  type: 'Math::Log10',
  category: 'Math',
  label: 'Log10',
  description: 'Base-10 logarithm',
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
      type: 'mathLog10',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
