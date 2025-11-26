import type { NodeDefinition } from '@sim4d/types';

interface MeshToShapeParams {
  tolerance: number;
  sewFaces: boolean;
}

interface MeshToShapeInputs {
  mesh: unknown;
}

interface MeshToShapeOutputs {
  shape: unknown;
}

export const MeshFilesMeshToShapeNode: NodeDefinition<
  MeshToShapeInputs,
  MeshToShapeOutputs,
  MeshToShapeParams
> = {
  id: 'Mesh::MeshToShape',
  category: 'Mesh',
  label: 'MeshToShape',
  description: 'Convert mesh to B-Rep',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    sewFaces: {
      type: 'boolean',
      label: 'Sew Faces',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'meshToShape',
      params: {
        mesh: inputs.mesh,
        tolerance: params.tolerance,
        sewFaces: params.sewFaces,
      },
    });

    return {
      shape: result,
    };
  },
};
