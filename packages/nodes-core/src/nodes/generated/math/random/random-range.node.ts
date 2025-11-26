import type { NodeDefinition } from '@sim4d/types';

interface RandomRangeParams {
  seed: number;
}

interface RandomRangeInputs {
  min: unknown;
  max: unknown;
}

interface RandomRangeOutputs {
  value: unknown;
}

export const MathRandomRandomRangeNode: NodeDefinition<
  RandomRangeInputs,
  RandomRangeOutputs,
  RandomRangeParams
> = {
  id: 'Math::RandomRange',
  category: 'Math',
  label: 'RandomRange',
  description: 'Random in range',
  inputs: {
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
    value: {
      type: 'number',
      label: 'Value',
    },
  },
  params: {
    seed: {
      type: 'number',
      label: 'Seed',
      default: -1,
      min: -1,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathRandomRange',
      params: {
        min: inputs.min,
        max: inputs.max,
        seed: params.seed,
      },
    });

    return {
      value: result,
    };
  },
};
