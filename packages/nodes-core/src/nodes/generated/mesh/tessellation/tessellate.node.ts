import type { NodeDefinition } from '@sim4d/types';

interface TessellateParams {
  linearDeflection: number;
  angularDeflection: number;
  relative: boolean;
  qualityNormals: boolean;
}

interface TessellateInputs {
  shape: unknown;
}

interface TessellateOutputs {
  mesh: unknown;
  triangleCount: unknown;
  vertexCount: unknown;
}

export const MeshTessellationTessellateNode: NodeDefinition<
  TessellateInputs,
  TessellateOutputs,
  TessellateParams
> = {
  id: 'Mesh::Tessellate',
  category: 'Mesh',
  label: 'Tessellate',
  description: 'Convert shape to mesh',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
    triangleCount: {
      type: 'number',
      label: 'Triangle Count',
    },
    vertexCount: {
      type: 'number',
      label: 'Vertex Count',
    },
  },
  params: {
    linearDeflection: {
      type: 'number',
      label: 'Linear Deflection',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
    angularDeflection: {
      type: 'number',
      label: 'Angular Deflection',
      default: 0.5,
      min: 0.01,
      max: 1,
    },
    relative: {
      type: 'boolean',
      label: 'Relative',
      default: false,
    },
    qualityNormals: {
      type: 'boolean',
      label: 'Quality Normals',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'tessellate',
      params: {
        shape: inputs.shape,
        linearDeflection: params.linearDeflection,
        angularDeflection: params.angularDeflection,
        relative: params.relative,
        qualityNormals: params.qualityNormals,
      },
    });

    return {
      mesh: results.mesh,
      triangleCount: results.triangleCount,
      vertexCount: results.vertexCount,
    };
  },
};
