import type { NodeDefinition } from '@sim4d/types';

interface ImportGLTFParams {
  importAnimations: boolean;
  importMaterials: boolean;
}

interface ImportGLTFInputs {
  fileData: unknown;
}

interface ImportGLTFOutputs {
  mesh: unknown;
  materials: unknown;
  animations: unknown;
}

export const IOExchangeImportGLTFNode: NodeDefinition<
  ImportGLTFInputs,
  ImportGLTFOutputs,
  ImportGLTFParams
> = {
  id: 'IO::ImportGLTF',
  type: 'IO::ImportGLTF',
  category: 'IO',
  label: 'ImportGLTF',
  description: 'Import GLTF/GLB model',
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
    animations: {
      type: 'Data',
      label: 'Animations',
    },
  },
  params: {
    importAnimations: {
      type: 'boolean',
      label: 'Import Animations',
      default: false,
    },
    importMaterials: {
      type: 'boolean',
      label: 'Import Materials',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importGLTF',
      params: {
        fileData: inputs.fileData,
        importAnimations: params.importAnimations,
        importMaterials: params.importMaterials,
      },
    });

    return {
      mesh: results.mesh,
      materials: results.materials,
      animations: results.animations,
    };
  },
};
