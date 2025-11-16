import type { NodeDefinition } from '@brepflow/types';

interface EaseInParams {
  power: number;
}

interface EaseInInputs {
  t: unknown;
}

interface EaseInOutputs {
  result: unknown;
}

export const MathInterpolationEaseInNode: NodeDefinition<
  EaseInInputs,
  EaseInOutputs,
  EaseInParams
> = {
  id: 'Math::EaseIn',
  type: 'Math::EaseIn',
  category: 'Math',
  label: 'EaseIn',
  description: 'Ease in curve',
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
      type: 'mathEaseIn',
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
