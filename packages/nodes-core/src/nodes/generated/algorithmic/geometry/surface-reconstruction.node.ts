import type { NodeDefinition } from '@sim4d/types';

interface SurfaceReconstructionParams {
  algorithm: string;
  depth: number;
  samples: number;
}

interface SurfaceReconstructionInputs {
  points: Array<[number, number, number]>;
  normals?: Array<[number, number, number]>;
}

interface SurfaceReconstructionOutputs {
  surface: unknown;
  mesh: unknown;
  quality: unknown;
}

export const AlgorithmicGeometrySurfaceReconstructionNode: NodeDefinition<
  SurfaceReconstructionInputs,
  SurfaceReconstructionOutputs,
  SurfaceReconstructionParams
> = {
  id: 'Algorithmic::SurfaceReconstruction',
  category: 'Algorithmic',
  label: 'SurfaceReconstruction',
  description: 'Reconstruct surface from point cloud',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    normals: {
      type: 'Vector[]',
      label: 'Normals',
      optional: true,
    },
  },
  outputs: {
    surface: {
      type: 'Shape',
      label: 'Surface',
    },
    mesh: {
      type: 'Shape',
      label: 'Mesh',
    },
    quality: {
      type: 'number',
      label: 'Quality',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'poisson',
      options: ['poisson', 'delaunay', 'rbf'],
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 8,
      min: 4,
      max: 12,
    },
    samples: {
      type: 'number',
      label: 'Samples',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceReconstruction',
      params: {
        points: inputs.points,
        normals: inputs.normals,
        algorithm: params.algorithm,
        depth: params.depth,
        samples: params.samples,
      },
    });

    return {
      surface: results.surface,
      mesh: results.mesh,
      quality: results.quality,
    };
  },
};
