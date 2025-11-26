import { NodeDefinition } from '@sim4d/types';

interface Params {
  importAnimations: boolean;
  importMaterials: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  mesh: Mesh;
  materials: Data;
  animations: Data;
}

export const ImportGLTFNode: NodeDefinition<ImportGLTFInputs, ImportGLTFOutputs, ImportGLTFParams> =
  {
    type: 'IO::ImportGLTF',
    category: 'IO',
    subcategory: 'Exchange',

    metadata: {
      label: 'ImportGLTF',
      description: 'Import GLTF/GLB model',
    },

    params: {
      importAnimations: {
        default: false,
      },
      importMaterials: {
        default: true,
      },
    },

    inputs: {
      fileData: 'Data',
    },

    outputs: {
      mesh: 'Mesh',
      materials: 'Data',
      animations: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'importGLTF',
        params: {
          fileData: inputs.fileData,
          importAnimations: params.importAnimations,
          importMaterials: params.importMaterials,
        },
      });

      return {
        mesh: result,
        materials: result,
        animations: result,
      };
    },
  };
