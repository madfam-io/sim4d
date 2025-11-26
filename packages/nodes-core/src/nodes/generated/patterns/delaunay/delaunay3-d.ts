import type { NodeDefinition } from '@sim4d/types';

type Delaunay3DParams = Record<string, never>;

interface Delaunay3DInputs {
  points: Array<[number, number, number]>;
}

interface Delaunay3DOutputs {
  tetrahedra: unknown;
  mesh: unknown;
}

export const PatternsDelaunayDelaunay3DNode: NodeDefinition<
  Delaunay3DInputs,
  Delaunay3DOutputs,
  Delaunay3DParams
> = {
  id: 'Patterns::Delaunay3D',
  type: 'Patterns::Delaunay3D',
  category: 'Patterns',
  label: 'Delaunay3D',
  description: 'Create 3D Delaunay tetrahedralization',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    tetrahedra: {
      type: 'Shape[]',
      label: 'Tetrahedra',
    },
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'delaunay3D',
      params: {
        points: inputs.points,
      },
    });

    return {
      tetrahedra: results.tetrahedra,
      mesh: results.mesh,
    };
  },
};
