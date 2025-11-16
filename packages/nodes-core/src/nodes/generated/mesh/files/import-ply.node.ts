import type { NodeDefinition } from '@brepflow/types';

interface ImportPLYParams {
  importColors: boolean;
  importProperties: boolean;
}

interface ImportPLYInputs {
  fileData: unknown;
}

interface ImportPLYOutputs {
  mesh: unknown;
  properties: unknown;
}

export const MeshFilesImportPLYNode: NodeDefinition<
  ImportPLYInputs,
  ImportPLYOutputs,
  ImportPLYParams
> = {
  id: 'Mesh::ImportPLY',
  category: 'Mesh',
  label: 'ImportPLY',
  description: 'Import PLY mesh',
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
    properties: {
      type: 'Data',
      label: 'Properties',
    },
  },
  params: {
    importColors: {
      type: 'boolean',
      label: 'Import Colors',
      default: true,
    },
    importProperties: {
      type: 'boolean',
      label: 'Import Properties',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importPLY',
      params: {
        fileData: inputs.fileData,
        importColors: params.importColors,
        importProperties: params.importProperties,
      },
    });

    return {
      mesh: results.mesh,
      properties: results.properties,
    };
  },
};
