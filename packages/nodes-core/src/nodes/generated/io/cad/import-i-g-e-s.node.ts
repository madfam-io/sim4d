import { NodeDefinition } from '@sim4d/types';

interface Params {
  readSurfaces: boolean;
  readCurves: boolean;
  sequence: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  shape: Shape;
}

export const ImportIGESNode: NodeDefinition<ImportIGESInputs, ImportIGESOutputs, ImportIGESParams> =
  {
    type: 'IO::ImportIGES',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ImportIGES',
      description: 'Import IGES file',
    },

    params: {
      readSurfaces: {
        default: true,
      },
      readCurves: {
        default: true,
      },
      sequence: {
        default: true,
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
        type: 'importIGES',
        params: {
          fileData: inputs.fileData,
          readSurfaces: params.readSurfaces,
          readCurves: params.readCurves,
          sequence: params.sequence,
        },
      });

      return {
        shape: result,
      };
    },
  };
