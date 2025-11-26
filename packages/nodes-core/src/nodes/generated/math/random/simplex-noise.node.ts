import type { NodeDefinition } from '@sim4d/types';

interface SimplexNoiseParams {
  scale: number;
  seed: number;
}

interface SimplexNoiseInputs {
  x: unknown;
  y?: unknown;
  z?: unknown;
}

interface SimplexNoiseOutputs {
  noise: unknown;
}

export const MathRandomSimplexNoiseNode: NodeDefinition<
  SimplexNoiseInputs,
  SimplexNoiseOutputs,
  SimplexNoiseParams
> = {
  id: 'Math::SimplexNoise',
  category: 'Math',
  label: 'SimplexNoise',
  description: 'Simplex noise',
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
    scale: {
      type: 'number',
      label: 'Scale',
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
      type: 'mathSimplexNoise',
      params: {
        x: inputs.x,
        y: inputs.y,
        z: inputs.z,
        scale: params.scale,
        seed: params.seed,
      },
    });

    return {
      noise: result,
    };
  },
};
