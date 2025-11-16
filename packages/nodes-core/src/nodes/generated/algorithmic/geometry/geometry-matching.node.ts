import type { NodeDefinition } from '@brepflow/types';

interface GeometryMatchingParams {
  algorithm: string;
  tolerance: number;
  iterations: number;
}

interface GeometryMatchingInputs {
  source: unknown;
  target: unknown;
}

interface GeometryMatchingOutputs {
  transform: unknown;
  aligned: unknown;
  error: unknown;
  correspondences: unknown;
}

export const AlgorithmicGeometryGeometryMatchingNode: NodeDefinition<
  GeometryMatchingInputs,
  GeometryMatchingOutputs,
  GeometryMatchingParams
> = {
  id: 'Algorithmic::GeometryMatching',
  category: 'Algorithmic',
  label: 'GeometryMatching',
  description: 'Match and align geometries',
  inputs: {
    source: {
      type: 'Shape',
      label: 'Source',
      required: true,
    },
    target: {
      type: 'Shape',
      label: 'Target',
      required: true,
    },
  },
  outputs: {
    transform: {
      type: 'Properties',
      label: 'Transform',
    },
    aligned: {
      type: 'Shape',
      label: 'Aligned',
    },
    error: {
      type: 'number',
      label: 'Error',
    },
    correspondences: {
      type: 'Properties[]',
      label: 'Correspondences',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'icp',
      options: ['icp', 'feature', 'global'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 50,
      min: 10,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'geometryMatching',
      params: {
        source: inputs.source,
        target: inputs.target,
        algorithm: params.algorithm,
        tolerance: params.tolerance,
        iterations: params.iterations,
      },
    });

    return {
      transform: results.transform,
      aligned: results.aligned,
      error: results.error,
      correspondences: results.correspondences,
    };
  },
};
