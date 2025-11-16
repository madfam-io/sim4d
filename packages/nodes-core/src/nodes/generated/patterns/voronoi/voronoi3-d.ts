import type { NodeDefinition } from '@brepflow/types';

interface Voronoi3DParams {
  clipToBox: boolean;
}

interface Voronoi3DInputs {
  points: Array<[number, number, number]>;
  bounds?: unknown;
}

interface Voronoi3DOutputs {
  cells: unknown;
  faces: unknown;
}

export const PatternsVoronoiVoronoi3DNode: NodeDefinition<
  Voronoi3DInputs,
  Voronoi3DOutputs,
  Voronoi3DParams
> = {
  id: 'Patterns::Voronoi3D',
  type: 'Patterns::Voronoi3D',
  category: 'Patterns',
  label: 'Voronoi3D',
  description: 'Create 3D Voronoi cells',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    bounds: {
      type: 'Box',
      label: 'Bounds',
      optional: true,
    },
  },
  outputs: {
    cells: {
      type: 'Shape[]',
      label: 'Cells',
    },
    faces: {
      type: 'Face[]',
      label: 'Faces',
    },
  },
  params: {
    clipToBox: {
      type: 'boolean',
      label: 'Clip To Box',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'voronoi3D',
      params: {
        points: inputs.points,
        bounds: inputs.bounds,
        clipToBox: params.clipToBox,
      },
    });

    return {
      cells: results.cells,
      faces: results.faces,
    };
  },
};
