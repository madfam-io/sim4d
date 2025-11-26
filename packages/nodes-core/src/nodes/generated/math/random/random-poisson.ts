import type { NodeDefinition } from '@sim4d/types';

interface RandomPoissonParams {
  lambda: number;
  seed: number;
}

type RandomPoissonInputs = Record<string, never>;

interface RandomPoissonOutputs {
  value: unknown;
}

export const MathRandomRandomPoissonNode: NodeDefinition<
  RandomPoissonInputs,
  RandomPoissonOutputs,
  RandomPoissonParams
> = {
  id: 'Math::RandomPoisson',
  type: 'Math::RandomPoisson',
  category: 'Math',
  label: 'RandomPoisson',
  description: 'Poisson distribution',
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
      type: 'mathRandomPoisson',
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
