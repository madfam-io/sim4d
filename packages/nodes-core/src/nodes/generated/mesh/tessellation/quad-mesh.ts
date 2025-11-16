import type { NodeDefinition } from '@brepflow/types';

interface QuadMeshParams {
  targetQuadSize: number;
  quadDominance: number;
}

interface QuadMeshInputs {
  shape: unknown;
}

interface QuadMeshOutputs {
  quadMesh: unknown;
}

export const MeshTessellationQuadMeshNode: NodeDefinition<
  QuadMeshInputs,
  QuadMeshOutputs,
  QuadMeshParams
> = {
  id: 'Mesh::QuadMesh',
  type: 'Mesh::QuadMesh',
  category: 'Mesh',
  label: 'QuadMesh',
  description: 'Generate quad-dominant mesh',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    quadMesh: {
      type: 'Mesh',
      label: 'Quad Mesh',
    },
  },
  params: {
    targetQuadSize: {
      type: 'number',
      label: 'Target Quad Size',
      default: 5,
      min: 0.1,
      max: 100,
    },
    quadDominance: {
      type: 'number',
      label: 'Quad Dominance',
      default: 0.8,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'quadMesh',
      params: {
        shape: inputs.shape,
        targetQuadSize: params.targetQuadSize,
        quadDominance: params.quadDominance,
      },
    });

    return {
      quadMesh: result,
    };
  },
};
