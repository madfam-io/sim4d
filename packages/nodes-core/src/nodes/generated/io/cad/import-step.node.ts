import type { NodeDefinition } from '@sim4d/types';

interface ImportSTEPParams {
  readColors: boolean;
  readNames: boolean;
  readLayers: boolean;
  preferBrep: boolean;
}

interface ImportSTEPInputs {
  fileData: unknown;
}

interface ImportSTEPOutputs {
  shape: unknown;
  metadata: unknown;
}

export const IOCADImportSTEPNode: NodeDefinition<
  ImportSTEPInputs,
  ImportSTEPOutputs,
  ImportSTEPParams
> = {
  id: 'IO::ImportSTEP',
  category: 'IO',
  label: 'ImportSTEP',
  description: 'Import STEP file',
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
    metadata: {
      type: 'Data',
      label: 'Metadata',
    },
  },
  params: {
    readColors: {
      type: 'boolean',
      label: 'Read Colors',
      default: true,
    },
    readNames: {
      type: 'boolean',
      label: 'Read Names',
      default: true,
    },
    readLayers: {
      type: 'boolean',
      label: 'Read Layers',
      default: true,
    },
    preferBrep: {
      type: 'boolean',
      label: 'Prefer Brep',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importSTEP',
      params: {
        fileData: inputs.fileData,
        readColors: params.readColors,
        readNames: params.readNames,
        readLayers: params.readLayers,
        preferBrep: params.preferBrep,
      },
    });

    return {
      shape: results.shape,
      metadata: results.metadata,
    };
  },
};
