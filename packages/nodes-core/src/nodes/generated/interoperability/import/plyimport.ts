import type { NodeDefinition } from '@brepflow/types';

interface PLYImportParams {
  loadColors: boolean;
  loadNormals: boolean;
  scaleFactor: number;
}

interface PLYImportInputs {
  filePath: unknown;
}

interface PLYImportOutputs {
  points: Array<[number, number, number]>;
  colors: unknown;
  normals: Array<[number, number, number]>;
}

export const InteroperabilityImportPLYImportNode: NodeDefinition<
  PLYImportInputs,
  PLYImportOutputs,
  PLYImportParams
> = {
  id: 'Interoperability::PLYImport',
  type: 'Interoperability::PLYImport',
  category: 'Interoperability',
  label: 'PLYImport',
  description: 'Import PLY point cloud files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
    },
    colors: {
      type: 'number[][]',
      label: 'Colors',
    },
    normals: {
      type: 'Vector[]',
      label: 'Normals',
    },
  },
  params: {
    loadColors: {
      type: 'boolean',
      label: 'Load Colors',
      default: true,
    },
    loadNormals: {
      type: 'boolean',
      label: 'Load Normals',
      default: true,
    },
    scaleFactor: {
      type: 'number',
      label: 'Scale Factor',
      default: 1,
      min: 0.001,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'plyImport',
      params: {
        filePath: inputs.filePath,
        loadColors: params.loadColors,
        loadNormals: params.loadNormals,
        scaleFactor: params.scaleFactor,
      },
    });

    return {
      points: results.points,
      colors: results.colors,
      normals: results.normals,
    };
  },
};
