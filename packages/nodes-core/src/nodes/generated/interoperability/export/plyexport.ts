import type { NodeDefinition } from '@sim4d/types';

interface PLYExportParams {
  format: string;
  includeColors: boolean;
  includeNormals: boolean;
}

interface PLYExportInputs {
  points: Array<[number, number, number]>;
  filePath: unknown;
  colors?: unknown;
  normals?: Array<[number, number, number]>;
}

interface PLYExportOutputs {
  success: unknown;
  pointCount: unknown;
}

export const InteroperabilityExportPLYExportNode: NodeDefinition<
  PLYExportInputs,
  PLYExportOutputs,
  PLYExportParams
> = {
  id: 'Interoperability::PLYExport',
  type: 'Interoperability::PLYExport',
  category: 'Interoperability',
  label: 'PLYExport',
  description: 'Export point cloud to PLY format',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
    colors: {
      type: 'number[][]',
      label: 'Colors',
      optional: true,
    },
    normals: {
      type: 'Vector[]',
      label: 'Normals',
      optional: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    pointCount: {
      type: 'number',
      label: 'Point Count',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    includeColors: {
      type: 'boolean',
      label: 'Include Colors',
      default: false,
    },
    includeNormals: {
      type: 'boolean',
      label: 'Include Normals',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      success: results.success,
      pointCount: results.pointCount,
    };
  },
};
