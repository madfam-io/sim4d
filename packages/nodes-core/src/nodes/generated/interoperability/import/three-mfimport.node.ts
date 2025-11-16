import type { NodeDefinition } from '@brepflow/types';

interface ThreeMFImportParams {
  loadTextures: boolean;
  loadMaterials: boolean;
  units: string;
}

interface ThreeMFImportInputs {
  filePath: unknown;
}

interface ThreeMFImportOutputs {
  models: unknown;
  materials: unknown;
  build: unknown;
}

export const InteroperabilityImportThreeMFImportNode: NodeDefinition<
  ThreeMFImportInputs,
  ThreeMFImportOutputs,
  ThreeMFImportParams
> = {
  id: 'Interoperability::ThreeMFImport',
  category: 'Interoperability',
  label: 'ThreeMFImport',
  description: 'Import 3D Manufacturing Format files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    models: {
      type: 'Shape[]',
      label: 'Models',
    },
    materials: {
      type: 'Properties[]',
      label: 'Materials',
    },
    build: {
      type: 'Properties',
      label: 'Build',
    },
  },
  params: {
    loadTextures: {
      type: 'boolean',
      label: 'Load Textures',
      default: true,
    },
    loadMaterials: {
      type: 'boolean',
      label: 'Load Materials',
      default: true,
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'threeMFImport',
      params: {
        filePath: inputs.filePath,
        loadTextures: params.loadTextures,
        loadMaterials: params.loadMaterials,
        units: params.units,
      },
    });

    return {
      models: results.models,
      materials: results.materials,
      build: results.build,
    };
  },
};
