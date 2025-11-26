import type { NodeDefinition } from '@sim4d/types';

interface Voronoi2DParams {
  boundary: string;
  clipToBoundary: boolean;
}

interface Voronoi2DInputs {
  points: Array<[number, number, number]>;
  plane?: unknown;
}

interface Voronoi2DOutputs {
  cells: unknown;
  edges: unknown;
}

export const PatternsVoronoiVoronoi2DNode: NodeDefinition<
  Voronoi2DInputs,
  Voronoi2DOutputs,
  Voronoi2DParams
> = {
  id: 'Patterns::Voronoi2D',
  type: 'Patterns::Voronoi2D',
  category: 'Patterns',
  label: 'Voronoi2D',
  description: 'Create 2D Voronoi diagram',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    plane: {
      type: 'Plane',
      label: 'Plane',
      optional: true,
    },
  },
  outputs: {
    cells: {
      type: 'Wire[]',
      label: 'Cells',
    },
    edges: {
      type: 'Edge[]',
      label: 'Edges',
    },
  },
  params: {
    boundary: {
      type: 'enum',
      label: 'Boundary',
      default: 'box',
      options: ['box', 'circle', 'polygon'],
    },
    clipToBoundary: {
      type: 'boolean',
      label: 'Clip To Boundary',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'voronoi2D',
      params: {
        points: inputs.points,
        plane: inputs.plane,
        boundary: params.boundary,
        clipToBoundary: params.clipToBoundary,
      },
    });

    return {
      cells: results.cells,
      edges: results.edges,
    };
  },
};
