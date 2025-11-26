import { NodeDefinition } from '@sim4d/types';

interface Params {
  importColors: boolean;
  importProperties: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  mesh: Mesh;
  properties: Data;
}

export const ImportPLYNode: NodeDefinition<ImportPLYInputs, ImportPLYOutputs, ImportPLYParams> = {
  type: 'Mesh::ImportPLY',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'ImportPLY',
    description: 'Import PLY mesh',
  },

  params: {
    importColors: {
      default: true,
    },
    importProperties: {
      default: true,
    },
  },

  inputs: {
    fileData: 'Data',
  },

  outputs: {
    mesh: 'Mesh',
    properties: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importPLY',
      params: {
        fileData: inputs.fileData,
        importColors: params.importColors,
        importProperties: params.importProperties,
      },
    });

    return {
      mesh: result,
      properties: result,
    };
  },
};
