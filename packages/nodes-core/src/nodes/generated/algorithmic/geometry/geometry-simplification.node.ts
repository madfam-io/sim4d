import type { NodeDefinition } from '@sim4d/types';

interface GeometrySimplificationParams {
  algorithm: string;
  reduction: number;
  preserveBoundary: boolean;
}

interface GeometrySimplificationInputs {
  geometry: unknown;
}

interface GeometrySimplificationOutputs {
  simplified: unknown;
  reductionRatio: unknown;
  error: unknown;
}

export const AlgorithmicGeometryGeometrySimplificationNode: NodeDefinition<
  GeometrySimplificationInputs,
  GeometrySimplificationOutputs,
  GeometrySimplificationParams
> = {
  id: 'Algorithmic::GeometrySimplification',
  category: 'Algorithmic',
  label: 'GeometrySimplification',
  description: 'Simplify complex geometry',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    simplified: {
      type: 'Shape',
      label: 'Simplified',
    },
    reductionRatio: {
      type: 'number',
      label: 'Reduction Ratio',
    },
    error: {
      type: 'number',
      label: 'Error',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'quadric',
      options: ['decimate', 'quadric', 'vertex'],
    },
    reduction: {
      type: 'number',
      label: 'Reduction',
      default: 0.5,
      min: 0.1,
      max: 0.9,
    },
    preserveBoundary: {
      type: 'boolean',
      label: 'Preserve Boundary',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'geometrySimplification',
      params: {
        geometry: inputs.geometry,
        algorithm: params.algorithm,
        reduction: params.reduction,
        preserveBoundary: params.preserveBoundary,
      },
    });

    return {
      simplified: results.simplified,
      reductionRatio: results.reductionRatio,
      error: results.error,
    };
  },
};
