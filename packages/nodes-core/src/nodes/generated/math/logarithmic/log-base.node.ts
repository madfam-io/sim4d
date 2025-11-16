import type { NodeDefinition } from '@brepflow/types';

type LogBaseParams = Record<string, never>;

interface LogBaseInputs {
  value: unknown;
  base: unknown;
}

interface LogBaseOutputs {
  result: unknown;
}

export const MathLogarithmicLogBaseNode: NodeDefinition<
  LogBaseInputs,
  LogBaseOutputs,
  LogBaseParams
> = {
  id: 'Math::LogBase',
  category: 'Math',
  label: 'LogBase',
  description: 'Logarithm with custom base',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
    base: {
      type: 'number',
      label: 'Base',
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
      type: 'mathLogBase',
      params: {
        value: inputs.value,
        base: inputs.base,
      },
    });

    return {
      result: result,
    };
  },
};
