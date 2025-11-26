import type { NodeDefinition } from '@sim4d/types';

interface PoissonDiskParams {
  radius: number;
  k: number;
}

interface PoissonDiskInputs {
  boundary: unknown;
}

interface PoissonDiskOutputs {
  points: Array<[number, number, number]>;
}

export const PatternsStochasticPoissonDiskNode: NodeDefinition<
  PoissonDiskInputs,
  PoissonDiskOutputs,
  PoissonDiskParams
> = {
  id: 'Patterns::PoissonDisk',
  category: 'Patterns',
  label: 'PoissonDisk',
  description: 'Poisson disk sampling',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 5,
      min: 0.1,
    },
    k: {
      type: 'number',
      label: 'K',
      default: 30,
      min: 3,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'poissonDisk',
      params: {
        boundary: inputs.boundary,
        radius: params.radius,
        k: params.k,
      },
    });

    return {
      points: result,
    };
  },
};
