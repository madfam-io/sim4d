import type { NodeDefinition } from '@brepflow/types';

interface DecimateMeshParams {
  targetTriangles: number;
  preserveFeatures: boolean;
  featureAngle: number;
}

interface DecimateMeshInputs {
  mesh: unknown;
}

interface DecimateMeshOutputs {
  decimated: unknown;
}

export const MeshRepairDecimateMeshNode: NodeDefinition<
  DecimateMeshInputs,
  DecimateMeshOutputs,
  DecimateMeshParams
> = {
  id: 'Mesh::DecimateMesh',
  type: 'Mesh::DecimateMesh',
  category: 'Mesh',
  label: 'DecimateMesh',
  description: 'Decimate mesh intelligently',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    decimated: {
      type: 'Mesh',
      label: 'Decimated',
    },
  },
  params: {
    targetTriangles: {
      type: 'number',
      label: 'Target Triangles',
      default: 1000,
      min: 10,
      max: 1000000,
      step: 100,
    },
    preserveFeatures: {
      type: 'boolean',
      label: 'Preserve Features',
      default: true,
    },
    featureAngle: {
      type: 'number',
      label: 'Feature Angle',
      default: 30,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'decimateMesh',
      params: {
        mesh: inputs.mesh,
        targetTriangles: params.targetTriangles,
        preserveFeatures: params.preserveFeatures,
        featureAngle: params.featureAngle,
      },
    });

    return {
      decimated: result,
    };
  },
};
