import { NodeDefinition } from '@sim4d/types';

interface Params {
  format: string;
  includeColors: boolean;
  includeNormals: boolean;
}
interface Inputs {
  points: Point[];
  filePath: string;
  colors?: number[][];
  normals?: Vector[];
}
interface Outputs {
  success: boolean;
  pointCount: number;
}

export const PLYExportNode: NodeDefinition<PLYExportInputs, PLYExportOutputs, PLYExportParams> = {
  type: 'Interoperability::PLYExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: 'PLYExport',
    description: 'Export point cloud to PLY format',
  },

  params: {
    format: {
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    includeColors: {
      default: false,
    },
    includeNormals: {
      default: false,
    },
  },

  inputs: {
    points: 'Point[]',
    filePath: 'string',
    colors: 'number[][]',
    normals: 'Vector[]',
  },

  outputs: {
    success: 'boolean',
    pointCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'plyExport',
      params: {
        points: inputs.points,
        filePath: inputs.filePath,
        colors: inputs.colors,
        normals: inputs.normals,
        format: params.format,
        includeColors: params.includeColors,
        includeNormals: params.includeNormals,
      },
    });

    return {
      success: result,
      pointCount: result,
    };
  },
};
