import type { NodeDefinition } from '@brepflow/types';

interface MarchingCubesParams {
  isovalue: number;
  resolution: number;
  smooth: boolean;
}

interface MarchingCubesInputs {
  scalarField: unknown;
}

interface MarchingCubesOutputs {
  mesh: unknown;
  vertices: Array<[number, number, number]>;
  normals: Array<[number, number, number]>;
}

export const AlgorithmicGeometryMarchingCubesNode: NodeDefinition<
  MarchingCubesInputs,
  MarchingCubesOutputs,
  MarchingCubesParams
> = {
  id: 'Algorithmic::MarchingCubes',
  category: 'Algorithmic',
  label: 'MarchingCubes',
  description: 'Extract isosurface using marching cubes',
  inputs: {
    scalarField: {
      type: 'Properties',
      label: 'Scalar Field',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Shape',
      label: 'Mesh',
    },
    vertices: {
      type: 'Point[]',
      label: 'Vertices',
    },
    normals: {
      type: 'Vector[]',
      label: 'Normals',
    },
  },
  params: {
    isovalue: {
      type: 'number',
      label: 'Isovalue',
      default: 0,
      min: -100,
      max: 100,
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 32,
      min: 8,
      max: 128,
    },
    smooth: {
      type: 'boolean',
      label: 'Smooth',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'marchingCubes',
      params: {
        scalarField: inputs.scalarField,
        isovalue: params.isovalue,
        resolution: params.resolution,
        smooth: params.smooth,
      },
    });

    return {
      mesh: results.mesh,
      vertices: results.vertices,
      normals: results.normals,
    };
  },
};
