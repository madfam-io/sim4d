import type { NodeDefinition } from '@sim4d/types';

interface RandomParams {
  seed: number;
}

type RandomInputs = Record<string, never>;

interface RandomOutputs {
  value: unknown;
}

export const MathRandomRandomNode: NodeDefinition<RandomInputs, RandomOutputs, RandomParams> = {
  id: 'Math::Random',
  type: 'Math::Random',
  category: 'Math',
  label: 'Random',
  description: 'Random number 0-1',
  inputs: {},
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
      type: 'mathRandom',
      params: {
        seed: params.seed,
      },
    });

    return {
      value: result,
    };
  },
};
