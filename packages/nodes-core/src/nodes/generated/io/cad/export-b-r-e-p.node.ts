import { NodeDefinition } from '@sim4d/types';

interface Params {
  binary: boolean;
}
interface Inputs {
  shape: Shape;
}
interface Outputs {
  brepData: Data;
}

export const ExportBREPNode: NodeDefinition<ExportBREPInputs, ExportBREPOutputs, ExportBREPParams> =
  {
    type: 'IO::ExportBREP',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ExportBREP',
      description: 'Export to BREP format',
    },

    params: {
      binary: {
        default: false,
      },
    },

    inputs: {
      shape: 'Shape',
    },

    outputs: {
      brepData: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'exportBREP',
        params: {
          shape: inputs.shape,
          binary: params.binary,
        },
      });

      return {
        brepData: result,
      };
    },
  };
