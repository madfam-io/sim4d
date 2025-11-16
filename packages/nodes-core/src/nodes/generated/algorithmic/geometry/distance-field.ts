import type { NodeDefinition } from '@brepflow/types';

interface DistanceFieldParams {
  resolution: number;
  bounds: unknown;
  signed: boolean;
}

interface DistanceFieldInputs {
  geometry: unknown;
}

interface DistanceFieldOutputs {
  field: unknown;
  isosurface: unknown;
  gradient: Array<[number, number, number]>;
}

export const AlgorithmicGeometryDistanceFieldNode: NodeDefinition<
  DistanceFieldInputs,
  DistanceFieldOutputs,
  DistanceFieldParams
> = {
  id: 'Algorithmic::DistanceField',
  type: 'Algorithmic::DistanceField',
  category: 'Algorithmic',
  label: 'DistanceField',
  description: 'Compute signed distance field',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'Properties',
      label: 'Field',
    },
    isosurface: {
      type: 'Shape',
      label: 'Isosurface',
    },
    gradient: {
      type: 'Vector[]',
      label: 'Gradient',
    },
  },
  params: {
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 50,
      min: 10,
      max: 200,
    },
    bounds: {
      type: 'Vector',
      label: 'Bounds',
      default: '100,100,100',
    },
    signed: {
      type: 'boolean',
      label: 'Signed',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'distanceField',
      params: {
        geometry: inputs.geometry,
        resolution: params.resolution,
        bounds: params.bounds,
        signed: params.signed,
      },
    });

    return {
      field: results.field,
      isosurface: results.isosurface,
      gradient: results.gradient,
    };
  },
};
