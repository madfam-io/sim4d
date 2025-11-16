import type { NodeDefinition } from '@brepflow/types';

interface OBJExportParams {
  includeNormals: boolean;
  includeTexCoords: boolean;
  smoothing: boolean;
}

interface OBJExportInputs {
  meshes: unknown;
  filePath: unknown;
}

interface OBJExportOutputs {
  success: unknown;
  vertexCount: unknown;
  faceCount: unknown;
}

export const InteroperabilityExportOBJExportNode: NodeDefinition<
  OBJExportInputs,
  OBJExportOutputs,
  OBJExportParams
> = {
  id: 'Interoperability::OBJExport',
  type: 'Interoperability::OBJExport',
  category: 'Interoperability',
  label: 'OBJExport',
  description: 'Export mesh to OBJ format',
  inputs: {
    meshes: {
      type: 'Shape[]',
      label: 'Meshes',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    vertexCount: {
      type: 'number',
      label: 'Vertex Count',
    },
    faceCount: {
      type: 'number',
      label: 'Face Count',
    },
  },
  params: {
    includeNormals: {
      type: 'boolean',
      label: 'Include Normals',
      default: true,
    },
    includeTexCoords: {
      type: 'boolean',
      label: 'Include Tex Coords',
      default: false,
    },
    smoothing: {
      type: 'boolean',
      label: 'Smoothing',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'objExport',
      params: {
        meshes: inputs.meshes,
        filePath: inputs.filePath,
        includeNormals: params.includeNormals,
        includeTexCoords: params.includeTexCoords,
        smoothing: params.smoothing,
      },
    });

    return {
      success: results.success,
      vertexCount: results.vertexCount,
      faceCount: results.faceCount,
    };
  },
};
