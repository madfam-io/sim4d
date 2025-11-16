import type { NodeDefinition } from '@brepflow/types';

interface PackingCirclesParams {
  algorithm: string;
}

interface PackingCirclesInputs {
  boundary: unknown;
  radii: unknown;
}

interface PackingCirclesOutputs {
  circles: unknown;
  centers: Array<[number, number, number]>;
}

export const PatternsAlgorithmicPackingCirclesNode: NodeDefinition<
  PackingCirclesInputs,
  PackingCirclesOutputs,
  PackingCirclesParams
> = {
  id: 'Patterns::PackingCircles',
  category: 'Patterns',
  label: 'PackingCircles',
  description: 'Circle packing algorithms',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
    radii: {
      type: 'number[]',
      label: 'Radii',
      required: true,
    },
  },
  outputs: {
    circles: {
      type: 'Wire[]',
      label: 'Circles',
    },
    centers: {
      type: 'Point[]',
      label: 'Centers',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'power-diagram',
      options: ['power-diagram', 'front-chain', 'apollonian'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'packingCircles',
      params: {
        boundary: inputs.boundary,
        radii: inputs.radii,
        algorithm: params.algorithm,
      },
    });

    return {
      circles: results.circles,
      centers: results.centers,
    };
  },
};
