import { NodeDefinition } from '@sim4d/types';

interface Params {
  scale: number;
  flipNormals: boolean;
  loadMaterials: boolean;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  meshes: Shape[];
  materials: Properties[];
  groups: string[];
}

export const OBJImportNode: NodeDefinition<OBJImportInputs, OBJImportOutputs, OBJImportParams> = {
  type: 'Interoperability::OBJImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: 'OBJImport',
    description: 'Import Wavefront OBJ files',
  },

  params: {
    scale: {
      default: 1,
      min: 0.001,
      max: 1000,
    },
    flipNormals: {
      default: false,
    },
    loadMaterials: {
      default: true,
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    meshes: 'Shape[]',
    materials: 'Properties[]',
    groups: 'string[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'objImport',
      params: {
        filePath: inputs.filePath,
        scale: params.scale,
        flipNormals: params.flipNormals,
        loadMaterials: params.loadMaterials,
      },
    });

    return {
      meshes: result,
      materials: result,
      groups: result,
    };
  },
};
