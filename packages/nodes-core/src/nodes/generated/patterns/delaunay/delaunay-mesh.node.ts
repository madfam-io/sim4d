import type { NodeDefinition } from '@sim4d/types';

interface DelaunayMeshParams {
  targetSize: number;
  minAngle: number;
}

interface DelaunayMeshInputs {
  boundary: unknown;
}

interface DelaunayMeshOutputs {
  mesh: unknown;
}

export const PatternsDelaunayDelaunayMeshNode: NodeDefinition<
  DelaunayMeshInputs,
  DelaunayMeshOutputs,
  DelaunayMeshParams
> = {
  id: 'Patterns::DelaunayMesh',
  category: 'Patterns',
  label: 'DelaunayMesh',
  description: 'Quality mesh generation',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
  },
  params: {
    targetSize: {
      type: 'number',
      label: 'Target Size',
      default: 10,
      min: 0.1,
    },
    minAngle: {
      type: 'number',
      label: 'Min Angle',
      default: 20,
      min: 0,
      max: 60,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'delaunayMesh',
      params: {
        boundary: inputs.boundary,
        targetSize: params.targetSize,
        minAngle: params.minAngle,
      },
    });

    return {
      mesh: result,
    };
  },
};
