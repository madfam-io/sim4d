import type { NodeDefinition } from '@sim4d/types';

interface SimplifyMeshParams {
  targetRatio: number;
  preserveBoundaries: boolean;
  preserveTopology: boolean;
  maxError: number;
}

interface SimplifyMeshInputs {
  mesh: unknown;
}

interface SimplifyMeshOutputs {
  simplified: unknown;
  triangleCount: unknown;
}

export const MeshRepairSimplifyMeshNode: NodeDefinition<
  SimplifyMeshInputs,
  SimplifyMeshOutputs,
  SimplifyMeshParams
> = {
  id: 'Mesh::SimplifyMesh',
  type: 'Mesh::SimplifyMesh',
  category: 'Mesh',
  label: 'SimplifyMesh',
  description: 'Reduce mesh complexity',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    simplified: {
      type: 'Mesh',
      label: 'Simplified',
    },
    triangleCount: {
      type: 'number',
      label: 'Triangle Count',
    },
  },
  params: {
    targetRatio: {
      type: 'number',
      label: 'Target Ratio',
      default: 0.5,
      min: 0.01,
      max: 1,
    },
    preserveBoundaries: {
      type: 'boolean',
      label: 'Preserve Boundaries',
      default: true,
    },
    preserveTopology: {
      type: 'boolean',
      label: 'Preserve Topology',
      default: false,
    },
    maxError: {
      type: 'number',
      label: 'Max Error',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'simplifyMesh',
      params: {
        mesh: inputs.mesh,
        targetRatio: params.targetRatio,
        preserveBoundaries: params.preserveBoundaries,
        preserveTopology: params.preserveTopology,
        maxError: params.maxError,
      },
    });

    return {
      simplified: results.simplified,
      triangleCount: results.triangleCount,
    };
  },
};
