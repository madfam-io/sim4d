import type { NodeDefinition } from '@brepflow/types';

interface SmoothMeshParams {
  iterations: number;
  smoothingFactor: number;
  preserveVolume: boolean;
}

interface SmoothMeshInputs {
  mesh: unknown;
}

interface SmoothMeshOutputs {
  smoothed: unknown;
}

export const MeshRepairSmoothMeshNode: NodeDefinition<
  SmoothMeshInputs,
  SmoothMeshOutputs,
  SmoothMeshParams
> = {
  id: 'Mesh::SmoothMesh',
  type: 'Mesh::SmoothMesh',
  category: 'Mesh',
  label: 'SmoothMesh',
  description: 'Smooth mesh surface',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    smoothed: {
      type: 'Mesh',
      label: 'Smoothed',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 5,
      min: 1,
      max: 100,
      step: 1,
    },
    smoothingFactor: {
      type: 'number',
      label: 'Smoothing Factor',
      default: 0.5,
      min: 0,
      max: 1,
    },
    preserveVolume: {
      type: 'boolean',
      label: 'Preserve Volume',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'smoothMesh',
      params: {
        mesh: inputs.mesh,
        iterations: params.iterations,
        smoothingFactor: params.smoothingFactor,
        preserveVolume: params.preserveVolume,
      },
    });

    return {
      smoothed: result,
    };
  },
};
