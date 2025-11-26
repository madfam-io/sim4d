import { NodeDefinition } from '@sim4d/types';

interface Params {
  readColors: boolean;
  readNames: boolean;
  readLayers: boolean;
  preferBrep: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  shape: Shape;
  metadata: Data;
}

export const ImportSTEPNode: NodeDefinition<ImportSTEPInputs, ImportSTEPOutputs, ImportSTEPParams> =
  {
    type: 'IO::ImportSTEP',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ImportSTEP',
      description: 'Import STEP file',
    },

    params: {
      readColors: {
        default: true,
      },
      readNames: {
        default: true,
      },
      readLayers: {
        default: true,
      },
      preferBrep: {
        default: true,
      },
    },

    inputs: {
      fileData: 'Data',
    },

    outputs: {
      shape: 'Shape',
      metadata: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
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
        shape: result,
        metadata: result,
      };
    },
  };
