import type { NodeDefinition } from '@sim4d/types';

interface HyperbolicTilingParams {
  p: number;
  q: number;
  iterations: number;
}

interface HyperbolicTilingInputs {
  disk: unknown;
}

interface HyperbolicTilingOutputs {
  tiling: unknown;
}

export const PatternsGeometricHyperbolicTilingNode: NodeDefinition<
  HyperbolicTilingInputs,
  HyperbolicTilingOutputs,
  HyperbolicTilingParams
> = {
  id: 'Patterns::HyperbolicTiling',
  type: 'Patterns::HyperbolicTiling',
  category: 'Patterns',
  label: 'HyperbolicTiling',
  description: 'Hyperbolic tessellation',
  inputs: {
    disk: {
      type: 'Face',
      label: 'Disk',
      required: true,
    },
  },
  outputs: {
    tiling: {
      type: 'Wire[]',
      label: 'Tiling',
    },
  },
  params: {
    p: {
      type: 'number',
      label: 'P',
      default: 7,
      min: 3,
      max: 12,
      step: 1,
    },
    q: {
      type: 'number',
      label: 'Q',
      default: 3,
      min: 3,
      max: 12,
      step: 1,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 1,
      max: 5,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'hyperbolicTiling',
      params: {
        disk: inputs.disk,
        p: params.p,
        q: params.q,
        iterations: params.iterations,
      },
    });

    return {
      tiling: result,
    };
  },
};
