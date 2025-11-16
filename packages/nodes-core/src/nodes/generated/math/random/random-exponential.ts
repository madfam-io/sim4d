import type { NodeDefinition } from '@brepflow/types';

interface RandomExponentialParams {
  lambda: number;
  seed: number;
}

type RandomExponentialInputs = Record<string, never>;

interface RandomExponentialOutputs {
  value: unknown;
}

export const MathRandomRandomExponentialNode: NodeDefinition<
  RandomExponentialInputs,
  RandomExponentialOutputs,
  RandomExponentialParams
> = {
  id: 'Math::RandomExponential',
  type: 'Math::RandomExponential',
  category: 'Math',
  label: 'RandomExponential',
  description: 'Exponential distribution',
  inputs: {},
  outputs: {
    value: {
      type: 'number',
      label: 'Value',
    },
  },
  params: {
    lambda: {
      type: 'number',
      label: 'Lambda',
      default: 1,
      min: 0.01,
    },
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
      type: 'mathRandomExponential',
      params: {
        lambda: params.lambda,
        seed: params.seed,
      },
    });

    return {
      value: result,
    };
  },
};
