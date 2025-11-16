import type { NodeDefinition } from '@brepflow/types';

interface ImportParasolidParams {
  healGeometry: boolean;
  simplifyGeometry: boolean;
}

interface ImportParasolidInputs {
  fileData: unknown;
}

interface ImportParasolidOutputs {
  shape: unknown;
}

export const IOCADImportParasolidNode: NodeDefinition<
  ImportParasolidInputs,
  ImportParasolidOutputs,
  ImportParasolidParams
> = {
  id: 'IO::ImportParasolid',
  category: 'IO',
  label: 'ImportParasolid',
  description: 'Import Parasolid file',
  inputs: {
    fileData: {
      type: 'Data',
      label: 'File Data',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    healGeometry: {
      type: 'boolean',
      label: 'Heal Geometry',
      default: true,
    },
    simplifyGeometry: {
      type: 'boolean',
      label: 'Simplify Geometry',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importParasolid',
      params: {
        fileData: inputs.fileData,
        healGeometry: params.healGeometry,
        simplifyGeometry: params.simplifyGeometry,
      },
    });

    return {
      shape: result,
    };
  },
};
