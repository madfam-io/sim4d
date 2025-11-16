import type { NodeDefinition } from '@brepflow/types';

interface VoronoiSkeletonParams {
  pruning: number;
}

interface VoronoiSkeletonInputs {
  boundary: unknown;
}

interface VoronoiSkeletonOutputs {
  skeleton: unknown;
}

export const PatternsVoronoiVoronoiSkeletonNode: NodeDefinition<
  VoronoiSkeletonInputs,
  VoronoiSkeletonOutputs,
  VoronoiSkeletonParams
> = {
  id: 'Patterns::VoronoiSkeleton',
  category: 'Patterns',
  label: 'VoronoiSkeleton',
  description: 'Medial axis from Voronoi',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    skeleton: {
      type: 'Wire[]',
      label: 'Skeleton',
    },
  },
  params: {
    pruning: {
      type: 'number',
      label: 'Pruning',
      default: 0.1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiSkeleton',
      params: {
        boundary: inputs.boundary,
        pruning: params.pruning,
      },
    });

    return {
      skeleton: result,
    };
  },
};
