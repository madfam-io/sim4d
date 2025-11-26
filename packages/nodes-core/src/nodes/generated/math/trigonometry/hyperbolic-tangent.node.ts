import type { NodeDefinition } from '@sim4d/types';

type HyperbolicTangentParams = Record<string, never>;

interface HyperbolicTangentInputs {
  value: unknown;
}

interface HyperbolicTangentOutputs {
  result: unknown;
}

export const MathTrigonometryHyperbolicTangentNode: NodeDefinition<
  HyperbolicTangentInputs,
  HyperbolicTangentOutputs,
  HyperbolicTangentParams
> = {
  id: 'Math::HyperbolicTangent',
  category: 'Math',
  label: 'HyperbolicTangent',
  description: 'Hyperbolic tangent',
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
      type: 'mathTanh',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
