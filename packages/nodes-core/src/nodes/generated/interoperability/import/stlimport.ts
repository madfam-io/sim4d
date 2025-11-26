import type { NodeDefinition } from '@sim4d/types';

interface STLImportParams {
  mergeVertices: boolean;
  tolerance: number;
  units: string;
}

interface STLImportInputs {
  filePath: unknown;
}

interface STLImportOutputs {
  mesh: unknown;
  triangleCount: unknown;
  vertexCount: unknown;
}

export const InteroperabilityImportSTLImportNode: NodeDefinition<
  STLImportInputs,
  STLImportOutputs,
  STLImportParams
> = {
  id: 'Interoperability::STLImport',
  type: 'Interoperability::STLImport',
  category: 'Interoperability',
  label: 'STLImport',
  description: 'Import STL mesh files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    mesh: {
      type: 'Shape',
      label: 'Mesh',
    },
    triangleCount: {
      type: 'number',
      label: 'Triangle Count',
    },
    vertexCount: {
      type: 'number',
      label: 'Vertex Count',
    },
  },
  params: {
    mergeVertices: {
      type: 'boolean',
      label: 'Merge Vertices',
      default: true,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stlImport',
      params: {
        filePath: inputs.filePath,
        mergeVertices: params.mergeVertices,
        tolerance: params.tolerance,
        units: params.units,
      },
    });

    return {
      mesh: results.mesh,
      triangleCount: results.triangleCount,
      vertexCount: results.vertexCount,
    };
  },
};
