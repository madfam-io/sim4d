import { NodeDefinition } from '@brepflow/types';

interface Params {
  format: string;
  units: string;
}
interface Inputs {
  mesh: Mesh;
}
interface Outputs {
  stlData: Data;
}

export const ExportSTLNode: NodeDefinition<ExportSTLInputs, ExportSTLOutputs, ExportSTLParams> = {
  type: 'Mesh::ExportSTL',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'ExportSTL',
    description: 'Export mesh to STL',
  },

  params: {
    format: {
      default: 'binary',
      options: ['ascii', 'binary'],
    },
    units: {
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch', 'foot'],
    },
  },

  inputs: {
    mesh: 'Mesh',
  },

  outputs: {
    stlData: 'Data',
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
