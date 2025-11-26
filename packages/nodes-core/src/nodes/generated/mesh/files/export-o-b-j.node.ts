import { NodeDefinition } from '@sim4d/types';

interface Params {
  exportNormals: boolean;
  exportUVs: boolean;
}
interface Inputs {
  mesh: Mesh;
  materials?: Data;
}
interface Outputs {
  objData: Data;
  mtlData: Data;
}

export const ExportOBJNode: NodeDefinition<ExportOBJInputs, ExportOBJOutputs, ExportOBJParams> = {
  type: 'Mesh::ExportOBJ',
  category: 'Mesh',
  subcategory: 'Files',

  metadata: {
    label: 'ExportOBJ',
    description: 'Export mesh to OBJ',
  },

  params: {
    exportNormals: {
      default: true,
    },
    exportUVs: {
      default: false,
    },
  },

  inputs: {
    mesh: 'Mesh',
    materials: 'Data',
  },

  outputs: {
    objData: 'Data',
    mtlData: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportOBJ',
      params: {
        mesh: inputs.mesh,
        materials: inputs.materials,
        exportNormals: params.exportNormals,
        exportUVs: params.exportUVs,
      },
    });

    return {
      objData: result,
      mtlData: result,
    };
  },
};
