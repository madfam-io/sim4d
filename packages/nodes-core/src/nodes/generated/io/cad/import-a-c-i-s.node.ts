import { NodeDefinition } from '@sim4d/types';

interface Params {
  version: string;
  healGeometry: boolean;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  shape: Shape;
}

export const ImportACISNode: NodeDefinition<ImportACISInputs, ImportACISOutputs, ImportACISParams> =
  {
    type: 'IO::ImportACIS',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ImportACIS',
      description: 'Import ACIS SAT file',
    },

    params: {
      version: {
        default: 'auto',
      },
      healGeometry: {
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
        type: 'importACIS',
        params: {
          fileData: inputs.fileData,
          version: params.version,
          healGeometry: params.healGeometry,
        },
      });

      return {
        shape: result,
      };
    },
  };
