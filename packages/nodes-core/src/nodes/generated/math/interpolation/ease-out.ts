import type { NodeDefinition } from '@sim4d/types';

interface EaseOutParams {
  power: number;
}

interface EaseOutInputs {
  t: unknown;
}

interface EaseOutOutputs {
  result: unknown;
}

export const MathInterpolationEaseOutNode: NodeDefinition<
  EaseOutInputs,
  EaseOutOutputs,
  EaseOutParams
> = {
  id: 'Math::EaseOut',
  type: 'Math::EaseOut',
  category: 'Math',
  label: 'EaseOut',
  description: 'Ease out curve',
  inputs: {
    t: {
      type: 'number',
      label: 'T',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {
    power: {
      type: 'number',
      label: 'Power',
      default: 2,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathEaseOut',
      params: {
        t: inputs.t,
        power: params.power,
      },
    });

    return {
      result: result,
    };
  },
};
