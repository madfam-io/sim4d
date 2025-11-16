import type { NodeDefinition } from '@brepflow/types';

interface OBJImportParams {
  scale: number;
  flipNormals: boolean;
  loadMaterials: boolean;
}

interface OBJImportInputs {
  filePath: unknown;
}

interface OBJImportOutputs {
  meshes: unknown;
  materials: unknown;
  groups: unknown;
}

export const InteroperabilityImportOBJImportNode: NodeDefinition<
  OBJImportInputs,
  OBJImportOutputs,
  OBJImportParams
> = {
  id: 'Interoperability::OBJImport',
  category: 'Interoperability',
  label: 'OBJImport',
  description: 'Import Wavefront OBJ files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    meshes: {
      type: 'Shape[]',
      label: 'Meshes',
    },
    materials: {
      type: 'Properties[]',
      label: 'Materials',
    },
    groups: {
      type: 'string[]',
      label: 'Groups',
    },
  },
  params: {
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    flipNormals: {
      type: 'boolean',
      label: 'Flip Normals',
      default: false,
    },
    loadMaterials: {
      type: 'boolean',
      label: 'Load Materials',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'objImport',
      params: {
        filePath: inputs.filePath,
        scale: params.scale,
        flipNormals: params.flipNormals,
        loadMaterials: params.loadMaterials,
      },
    });

    return {
      meshes: results.meshes,
      materials: results.materials,
      groups: results.groups,
    };
  },
};
