import { NodeDefinition } from '@sim4d/types';

interface Params {
  loadColors: boolean;
  loadNormals: boolean;
  scaleFactor: number;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  points: Point[];
  colors: number[][];
  normals: Vector[];
}

export const PLYImportNode: NodeDefinition<PLYImportInputs, PLYImportOutputs, PLYImportParams> = {
  type: 'Interoperability::PLYImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: 'PLYImport',
    description: 'Import PLY point cloud files',
  },

  params: {
    loadColors: {
      default: true,
    },
    loadNormals: {
      default: true,
    },
    scaleFactor: {
      default: 1,
      min: 0.001,
      max: 1000,
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    points: 'Point[]',
    colors: 'number[][]',
    normals: 'Vector[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'plyImport',
      params: {
        filePath: inputs.filePath,
        loadColors: params.loadColors,
        loadNormals: params.loadNormals,
        scaleFactor: params.scaleFactor,
      },
    });

    return {
      points: result,
      colors: result,
      normals: result,
    };
  },
};
