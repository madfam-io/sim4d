import { NodeDefinition } from '@sim4d/types';

interface Params {
  mergeVertices: boolean;
  tolerance: number;
  units: string;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  mesh: Shape;
  triangleCount: number;
  vertexCount: number;
}

export const STLImportNode: NodeDefinition<STLImportInputs, STLImportOutputs, STLImportParams> = {
  type: 'Interoperability::STLImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: 'STLImport',
    description: 'Import STL mesh files',
  },

  params: {
    mergeVertices: {
      default: true,
    },
    tolerance: {
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    units: {
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    mesh: 'Shape',
    triangleCount: 'number',
    vertexCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'stlImport',
      params: {
        filePath: inputs.filePath,
        mergeVertices: params.mergeVertices,
        tolerance: params.tolerance,
        units: params.units,
      },
    });

    return {
      mesh: result,
      triangleCount: result,
      vertexCount: result,
    };
  },
};
