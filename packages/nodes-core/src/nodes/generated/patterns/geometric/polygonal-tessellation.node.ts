import type { NodeDefinition } from '@brepflow/types';

interface PolygonalTessellationParams {
  polygonType: string;
  size: number;
}

interface PolygonalTessellationInputs {
  boundary: unknown;
}

interface PolygonalTessellationOutputs {
  tiles: unknown;
}

export const PatternsGeometricPolygonalTessellationNode: NodeDefinition<
  PolygonalTessellationInputs,
  PolygonalTessellationOutputs,
  PolygonalTessellationParams
> = {
  id: 'Patterns::PolygonalTessellation',
  category: 'Patterns',
  label: 'PolygonalTessellation',
  description: 'Regular polygon tessellation',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    tiles: {
      type: 'Face[]',
      label: 'Tiles',
    },
  },
  params: {
    polygonType: {
      type: 'enum',
      label: 'Polygon Type',
      default: 'hexagonal',
      options: ['triangular', 'square', 'hexagonal', 'octagonal'],
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'polygonTessellation',
      params: {
        boundary: inputs.boundary,
        polygonType: params.polygonType,
        size: params.size,
      },
    });

    return {
      tiles: result,
    };
  },
};
