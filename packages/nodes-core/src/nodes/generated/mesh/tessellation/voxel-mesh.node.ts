import type { NodeDefinition } from '@brepflow/types';

interface VoxelMeshParams {
  voxelSize: number;
  fillInterior: boolean;
}

interface VoxelMeshInputs {
  shape: unknown;
}

interface VoxelMeshOutputs {
  voxels: unknown;
}

export const MeshTessellationVoxelMeshNode: NodeDefinition<
  VoxelMeshInputs,
  VoxelMeshOutputs,
  VoxelMeshParams
> = {
  id: 'Mesh::VoxelMesh',
  category: 'Mesh',
  label: 'VoxelMesh',
  description: 'Create voxel mesh',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    voxels: {
      type: 'Mesh',
      label: 'Voxels',
    },
  },
  params: {
    voxelSize: {
      type: 'number',
      label: 'Voxel Size',
      default: 1,
      min: 0.01,
      max: 100,
    },
    fillInterior: {
      type: 'boolean',
      label: 'Fill Interior',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voxelMesh',
      params: {
        shape: inputs.shape,
        voxelSize: params.voxelSize,
        fillInterior: params.fillInterior,
      },
    });

    return {
      voxels: result,
    };
  },
};
