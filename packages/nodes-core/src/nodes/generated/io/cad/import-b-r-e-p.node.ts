import { NodeDefinition } from '@sim4d/types';

interface Params {
  version: string;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  shape: Shape;
}

export const ImportBREPNode: NodeDefinition<ImportBREPInputs, ImportBREPOutputs, ImportBREPParams> =
  {
    type: 'IO::ImportBREP',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ImportBREP',
      description: 'Import OpenCASCADE BREP',
    },

    params: {
      version: {
        default: 'auto',
      },
    },

    inputs: {
      fileData: 'Data',
    },

    outputs: {
      shape: 'Shape',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'importBREP',
        params: {
          fileData: inputs.fileData,
          version: params.version,
        },
      });

      return {
        shape: result,
      };
    },
  };
