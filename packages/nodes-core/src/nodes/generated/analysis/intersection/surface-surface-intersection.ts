import type { NodeDefinition } from '@sim4d/types';

interface SurfaceSurfaceIntersectionParams {
  tolerance: number;
  approximation: boolean;
}

interface SurfaceSurfaceIntersectionInputs {
  surface1: unknown;
  surface2: unknown;
}

interface SurfaceSurfaceIntersectionOutputs {
  intersectionCurves: unknown;
  intersectionPoints: Array<[number, number, number]>;
}

export const AnalysisIntersectionSurfaceSurfaceIntersectionNode: NodeDefinition<
  SurfaceSurfaceIntersectionInputs,
  SurfaceSurfaceIntersectionOutputs,
  SurfaceSurfaceIntersectionParams
> = {
  id: 'Analysis::SurfaceSurfaceIntersection',
  type: 'Analysis::SurfaceSurfaceIntersection',
  category: 'Analysis',
  label: 'SurfaceSurfaceIntersection',
  description: 'Find surface-surface intersection curves',
  inputs: {
    surface1: {
      type: 'Face',
      label: 'Surface1',
      required: true,
    },
    surface2: {
      type: 'Face',
      label: 'Surface2',
      required: true,
    },
  },
  outputs: {
    intersectionCurves: {
      type: 'Wire[]',
      label: 'Intersection Curves',
    },
    intersectionPoints: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    approximation: {
      type: 'boolean',
      label: 'Approximation',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceSurfaceIntersection',
      params: {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        tolerance: params.tolerance,
        approximation: params.approximation,
      },
    });

    return {
      intersectionCurves: results.intersectionCurves,
      intersectionPoints: results.intersectionPoints,
    };
  },
};
