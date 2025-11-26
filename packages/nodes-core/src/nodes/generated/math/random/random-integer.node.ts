import type { NodeDefinition } from '@sim4d/types';

interface RandomIntegerParams {
  seed: number;
}

interface RandomIntegerInputs {
  min: unknown;
  max: unknown;
}

interface RandomIntegerOutputs {
  value: unknown;
}

export const MathRandomRandomIntegerNode: NodeDefinition<
  RandomIntegerInputs,
  RandomIntegerOutputs,
  RandomIntegerParams
> = {
  id: 'Math::RandomInteger',
  category: 'Math',
  label: 'RandomInteger',
  description: 'Random integer',
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
      type: 'mathRandomInt',
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
