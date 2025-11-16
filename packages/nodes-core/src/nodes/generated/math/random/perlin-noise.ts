import type { NodeDefinition } from '@brepflow/types';

interface PerlinNoiseParams {
  octaves: number;
  persistence: number;
  seed: number;
}

interface PerlinNoiseInputs {
  x: unknown;
  y?: unknown;
  z?: unknown;
}

interface PerlinNoiseOutputs {
  noise: unknown;
}

export const MathRandomPerlinNoiseNode: NodeDefinition<
  PerlinNoiseInputs,
  PerlinNoiseOutputs,
  PerlinNoiseParams
> = {
  id: 'Math::PerlinNoise',
  type: 'Math::PerlinNoise',
  category: 'Math',
  label: 'PerlinNoise',
  description: 'Perlin noise',
  inputs: {
    x: {
      type: 'number',
      label: 'X',
      required: true,
    },
    y: {
      type: 'number',
      label: 'Y',
      optional: true,
    },
    z: {
      type: 'number',
      label: 'Z',
      optional: true,
    },
  },
  outputs: {
    noise: {
      type: 'number',
      label: 'Noise',
    },
  },
  params: {
    octaves: {
      type: 'number',
      label: 'Octaves',
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
    persistence: {
      type: 'number',
      label: 'Persistence',
      default: 0.5,
      min: 0,
      max: 1,
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
      type: 'mathPerlinNoise',
      params: {
        x: inputs.x,
        y: inputs.y,
        z: inputs.z,
        octaves: params.octaves,
        persistence: params.persistence,
        seed: params.seed,
      },
    });

    return {
      noise: result,
    };
  },
};
