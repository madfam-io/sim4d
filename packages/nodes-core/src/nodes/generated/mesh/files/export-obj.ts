import type { NodeDefinition } from '@sim4d/types';

interface ExportOBJParams {
  exportNormals: boolean;
  exportUVs: boolean;
}

interface ExportOBJInputs {
  mesh: unknown;
  materials?: unknown;
}

interface ExportOBJOutputs {
  objData: unknown;
  mtlData: unknown;
}

export const MeshFilesExportOBJNode: NodeDefinition<
  ExportOBJInputs,
  ExportOBJOutputs,
  ExportOBJParams
> = {
  id: 'Mesh::ExportOBJ',
  type: 'Mesh::ExportOBJ',
  category: 'Mesh',
  label: 'ExportOBJ',
  description: 'Export mesh to OBJ',
  inputs: {
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
      required: true,
    },
    materials: {
      type: 'Data',
      label: 'Materials',
      optional: true,
    },
  },
  outputs: {
    objData: {
      type: 'Data',
      label: 'Obj Data',
    },
    mtlData: {
      type: 'Data',
      label: 'Mtl Data',
    },
  },
  params: {
    exportNormals: {
      type: 'boolean',
      label: 'Export Normals',
      default: true,
    },
    exportUVs: {
      type: 'boolean',
      label: 'Export UVs',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'exportOBJ',
      params: {
        mesh: inputs.mesh,
        materials: inputs.materials,
        exportNormals: params.exportNormals,
        exportUVs: params.exportUVs,
      },
    });

    return {
      objData: results.objData,
      mtlData: results.mtlData,
    };
  },
};
