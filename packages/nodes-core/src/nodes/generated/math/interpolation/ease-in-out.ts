import type { NodeDefinition } from '@brepflow/types';

interface EaseInOutParams {
  power: number;
}

interface EaseInOutInputs {
  t: unknown;
}

interface EaseInOutOutputs {
  result: unknown;
}

export const MathInterpolationEaseInOutNode: NodeDefinition<
  EaseInOutInputs,
  EaseInOutOutputs,
  EaseInOutParams
> = {
  id: 'Math::EaseInOut',
  type: 'Math::EaseInOut',
  category: 'Math',
  label: 'EaseInOut',
  description: 'Ease in-out curve',
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
      type: 'mathEaseInOut',
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
