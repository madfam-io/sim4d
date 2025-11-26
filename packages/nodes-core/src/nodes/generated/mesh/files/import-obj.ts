import type { NodeDefinition } from '@sim4d/types';

interface ImportOBJParams {
  importMaterials: boolean;
  importTextures: boolean;
}

interface ImportOBJInputs {
  fileData: unknown;
}

interface ImportOBJOutputs {
  mesh: unknown;
  materials: unknown;
}

export const MeshFilesImportOBJNode: NodeDefinition<
  ImportOBJInputs,
  ImportOBJOutputs,
  ImportOBJParams
> = {
  id: 'Mesh::ImportOBJ',
  type: 'Mesh::ImportOBJ',
  category: 'Mesh',
  label: 'ImportOBJ',
  description: 'Import OBJ mesh',
  inputs: {
    fileData: {
      type: 'Data',
      label: 'File Data',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
    materials: {
      type: 'Data',
      label: 'Materials',
    },
  },
  params: {
    importMaterials: {
      type: 'boolean',
      label: 'Import Materials',
      default: true,
    },
    importTextures: {
      type: 'boolean',
      label: 'Import Textures',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importOBJ',
      params: {
        fileData: inputs.fileData,
        importMaterials: params.importMaterials,
        importTextures: params.importTextures,
      },
    });

    return {
      mesh: results.mesh,
      materials: results.materials,
    };
  },
};
