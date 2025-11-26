import type { NodeDefinition } from '@sim4d/types';

type CeilingParams = Record<string, never>;

interface CeilingInputs {
  value: unknown;
}

interface CeilingOutputs {
  result: unknown;
}

export const MathRoundingCeilingNode: NodeDefinition<CeilingInputs, CeilingOutputs, CeilingParams> =
  {
    id: 'Math::Ceiling',
    category: 'Math',
    label: 'Ceiling',
    description: 'Round up',
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
        type: 'mathCeil',
        params: {
          value: inputs.value,
        },
      });

      return {
        result: result,
      };
    },
  };
