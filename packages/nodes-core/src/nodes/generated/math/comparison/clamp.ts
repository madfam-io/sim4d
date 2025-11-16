import type { NodeDefinition } from '@brepflow/types';

type ClampParams = Record<string, never>;

interface ClampInputs {
  value: unknown;
  min: unknown;
  max: unknown;
}

interface ClampOutputs {
  result: unknown;
}

export const MathComparisonClampNode: NodeDefinition<ClampInputs, ClampOutputs, ClampParams> = {
  id: 'Math::Clamp',
  type: 'Math::Clamp',
  category: 'Math',
  label: 'Clamp',
  description: 'Clamp value between min and max',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
    min: {
      type: 'number',
      label: 'Min',
      required: true,
    },
    max: {
      type: 'number',
      label: 'Max',
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
      type: 'mathClamp',
      params: {
        value: inputs.value,
        min: inputs.min,
        max: inputs.max,
      },
    });

    return {
      result: result,
    };
  },
};
