import { NodeDefinition } from '@brepflow/types';

interface Params {
  includeNormals: boolean;
  includeTexCoords: boolean;
  smoothing: boolean;
}
interface Inputs {
  meshes: Shape[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  vertexCount: number;
  faceCount: number;
}

export const OBJExportNode: NodeDefinition<OBJExportInputs, OBJExportOutputs, OBJExportParams> = {
  type: 'Interoperability::OBJExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: 'OBJExport',
    description: 'Export mesh to OBJ format',
  },

  params: {
    includeNormals: {
      default: true,
    },
    includeTexCoords: {
      default: false,
    },
    smoothing: {
      default: true,
    },
  },

  inputs: {
    meshes: 'Shape[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    vertexCount: 'number',
    faceCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      success: result,
      vertexCount: result,
      faceCount: result,
    };
  },
};
