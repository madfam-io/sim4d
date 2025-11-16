import { NodeDefinition } from '@brepflow/types';

interface Params {
  importMaterials: boolean;
  importTextures: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  mesh: Mesh;
  materials: Data;
}

export const ImportOBJNode: NodeDefinition<ImportOBJInputs, ImportOBJOutputs, ImportOBJParams> = {
  type: 'Mesh::ImportOBJ',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'ImportOBJ',
    description: 'Import OBJ mesh',
  },

  params: {
    importMaterials: {
      default: true,
    },
    importTextures: {
      default: false,
    },
  },

  inputs: {
    fileData: 'Data',
  },

  outputs: {
    mesh: 'Mesh',
    materials: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importOBJ',
      params: {
        fileData: inputs.fileData,
        importMaterials: params.importMaterials,
        importTextures: params.importTextures,
      },
    });

    return {
      mesh: result,
      materials: result,
    };
  },
};
