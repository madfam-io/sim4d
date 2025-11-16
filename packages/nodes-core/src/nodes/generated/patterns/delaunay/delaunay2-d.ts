import type { NodeDefinition } from '@brepflow/types';

interface Delaunay2DParams {
  constrainEdges: boolean;
}

interface Delaunay2DInputs {
  points: Array<[number, number, number]>;
  constraints?: unknown;
}

interface Delaunay2DOutputs {
  triangles: unknown;
  mesh: unknown;
}

export const PatternsDelaunayDelaunay2DNode: NodeDefinition<
  Delaunay2DInputs,
  Delaunay2DOutputs,
  Delaunay2DParams
> = {
  id: 'Patterns::Delaunay2D',
  type: 'Patterns::Delaunay2D',
  category: 'Patterns',
  label: 'Delaunay2D',
  description: 'Create 2D Delaunay triangulation',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    constraints: {
      type: 'Edge[]',
      label: 'Constraints',
      optional: true,
    },
  },
  outputs: {
    triangles: {
      type: 'Face[]',
      label: 'Triangles',
    },
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
  },
  params: {
    constrainEdges: {
      type: 'boolean',
      label: 'Constrain Edges',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'delaunay2D',
      params: {
        points: inputs.points,
        constraints: inputs.constraints,
        constrainEdges: params.constrainEdges,
      },
    });

    return {
      triangles: results.triangles,
      mesh: results.mesh,
    };
  },
};
