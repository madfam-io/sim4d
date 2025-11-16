import type { NodeDefinition } from '@brepflow/types';

interface VoronoiOnSurfaceParams {
  geodesic: boolean;
}

interface VoronoiOnSurfaceInputs {
  surface: unknown;
  points: Array<[number, number, number]>;
}

interface VoronoiOnSurfaceOutputs {
  cells: unknown;
}

export const PatternsVoronoiVoronoiOnSurfaceNode: NodeDefinition<
  VoronoiOnSurfaceInputs,
  VoronoiOnSurfaceOutputs,
  VoronoiOnSurfaceParams
> = {
  id: 'Patterns::VoronoiOnSurface',
  category: 'Patterns',
  label: 'VoronoiOnSurface',
  description: 'Voronoi on curved surface',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    cells: {
      type: 'Wire[]',
      label: 'Cells',
    },
  },
  params: {
    geodesic: {
      type: 'boolean',
      label: 'Geodesic',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiSurface',
      params: {
        surface: inputs.surface,
        points: inputs.points,
        geodesic: params.geodesic,
      },
    });

    return {
      cells: result,
    };
  },
};
