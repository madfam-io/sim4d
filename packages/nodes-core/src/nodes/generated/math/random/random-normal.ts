import type { NodeDefinition } from '@brepflow/types';

interface RandomNormalParams {
  mean: number;
  stddev: number;
  seed: number;
}

type RandomNormalInputs = Record<string, never>;

interface RandomNormalOutputs {
  value: unknown;
}

export const MathRandomRandomNormalNode: NodeDefinition<
  RandomNormalInputs,
  RandomNormalOutputs,
  RandomNormalParams
> = {
  id: 'Math::RandomNormal',
  type: 'Math::RandomNormal',
  category: 'Math',
  label: 'RandomNormal',
  description: 'Normal distribution',
  inputs: {},
  outputs: {
    value: {
      type: 'number',
      label: 'Value',
    },
  },
  params: {
    mean: {
      type: 'number',
      label: 'Mean',
      default: 0,
    },
    stddev: {
      type: 'number',
      label: 'Stddev',
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
      type: 'mathRandomNormal',
      params: {
        mean: params.mean,
        stddev: params.stddev,
        seed: params.seed,
      },
    });

    return {
      value: result,
    };
  },
};
