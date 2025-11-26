import type { NodeDefinition } from '@sim4d/types';

interface CirclePackingParams {
  packingType: string;
  minRadius: number;
  maxRadius: number;
}

interface CirclePackingInputs {
  boundary: unknown;
}

interface CirclePackingOutputs {
  circles: unknown;
}

export const PatternsGeometricCirclePackingNode: NodeDefinition<
  CirclePackingInputs,
  CirclePackingOutputs,
  CirclePackingParams
> = {
  id: 'Patterns::CirclePacking',
  type: 'Patterns::CirclePacking',
  category: 'Patterns',
  label: 'CirclePacking',
  description: 'Circle packing pattern',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    circles: {
      type: 'Wire[]',
      label: 'Circles',
    },
  },
  params: {
    packingType: {
      type: 'enum',
      label: 'Packing Type',
      default: 'hexagonal',
      options: ['hexagonal', 'square', 'random', 'apollonian'],
    },
    minRadius: {
      type: 'number',
      label: 'Min Radius',
      default: 1,
      min: 0.1,
    },
    maxRadius: {
      type: 'number',
      label: 'Max Radius',
      default: 5,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'circlePacking',
      params: {
        boundary: inputs.boundary,
        packingType: params.packingType,
        minRadius: params.minRadius,
        maxRadius: params.maxRadius,
      },
    });

    return {
      circles: result,
    };
  },
};
