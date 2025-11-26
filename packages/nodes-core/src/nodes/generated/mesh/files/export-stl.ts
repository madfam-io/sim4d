import type { NodeDefinition } from '@sim4d/types';

interface ExportSTLParams {
  format: string;
  units: string;
}

interface ExportSTLInputs {
  mesh: unknown;
}

interface ExportSTLOutputs {
  stlData: unknown;
}

export const MeshFilesExportSTLNode: NodeDefinition<
  ExportSTLInputs,
  ExportSTLOutputs,
  ExportSTLParams
> = {
  id: 'Mesh::ExportSTL',
  type: 'Mesh::ExportSTL',
  category: 'Mesh',
  label: 'ExportSTL',
  description: 'Export mesh to STL',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
  },
  outputs: {
    stlData: {
      type: 'Data',
      label: 'Stl Data',
    },
  },
  params: {
    format: {
      type: 'enum',
      label: 'Format',
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch', 'foot'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportSTL',
      params: {
        mesh: inputs.mesh,
        format: params.format,
        units: params.units,
      },
    });

    return {
      stlData: result,
    };
  },
};
