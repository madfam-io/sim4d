import type { NodeDefinition } from '@brepflow/types';

type HyperbolicCosineParams = Record<string, never>;

interface HyperbolicCosineInputs {
  value: unknown;
}

interface HyperbolicCosineOutputs {
  result: unknown;
}

export const MathTrigonometryHyperbolicCosineNode: NodeDefinition<
  HyperbolicCosineInputs,
  HyperbolicCosineOutputs,
  HyperbolicCosineParams
> = {
  id: 'Math::HyperbolicCosine',
  type: 'Math::HyperbolicCosine',
  category: 'Math',
  label: 'HyperbolicCosine',
  description: 'Hyperbolic cosine',
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
      type: 'mathCosh',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
