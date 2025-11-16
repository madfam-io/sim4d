import type { NodeDefinition } from '@brepflow/types';

type HyperbolicSineParams = Record<string, never>;

interface HyperbolicSineInputs {
  value: unknown;
}

interface HyperbolicSineOutputs {
  result: unknown;
}

export const MathTrigonometryHyperbolicSineNode: NodeDefinition<
  HyperbolicSineInputs,
  HyperbolicSineOutputs,
  HyperbolicSineParams
> = {
  id: 'Math::HyperbolicSine',
  category: 'Math',
  label: 'HyperbolicSine',
  description: 'Hyperbolic sine',
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
      type: 'mathSinh',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
