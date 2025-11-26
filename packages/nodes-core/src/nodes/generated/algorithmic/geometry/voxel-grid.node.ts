import type { NodeDefinition } from '@sim4d/types';

interface VoxelGridParams {
  voxelSize: number;
  fillInterior: boolean;
  optimize: boolean;
}

interface VoxelGridInputs {
  geometry: unknown;
}

interface VoxelGridOutputs {
  voxels: unknown;
  grid: unknown;
  bounds: unknown;
}

export const AlgorithmicGeometryVoxelGridNode: NodeDefinition<
  VoxelGridInputs,
  VoxelGridOutputs,
  VoxelGridParams
> = {
  id: 'Algorithmic::VoxelGrid',
  category: 'Algorithmic',
  label: 'VoxelGrid',
  description: 'Convert geometry to voxel representation',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    voxels: {
      type: 'Shape[]',
      label: 'Voxels',
    },
    grid: {
      type: 'Properties',
      label: 'Grid',
    },
    bounds: {
      type: 'Properties',
      label: 'Bounds',
    },
  },
  params: {
    voxelSize: {
      type: 'number',
      label: 'Voxel Size',
      default: 1,
      min: 0.1,
      max: 10,
    },
    fillInterior: {
      type: 'boolean',
      label: 'Fill Interior',
      default: true,
    },
    optimize: {
      type: 'boolean',
      label: 'Optimize',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'voxelGrid',
      params: {
        geometry: inputs.geometry,
        voxelSize: params.voxelSize,
        fillInterior: params.fillInterior,
        optimize: params.optimize,
      },
    });

    return {
      voxels: results.voxels,
      grid: results.grid,
      bounds: results.bounds,
    };
  },
};
