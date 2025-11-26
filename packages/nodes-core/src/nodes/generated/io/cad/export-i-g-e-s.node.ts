import { NodeDefinition } from '@sim4d/types';

interface Params {
  brepMode: string;
  units: string;
  author: string;
}
interface Inputs {
  shape: Shape;
}
interface Outputs {
  igesData: Data;
}

export const ExportIGESNode: NodeDefinition<ExportIGESInputs, ExportIGESOutputs, ExportIGESParams> =
  {
    type: 'IO::ExportIGES',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ExportIGES',
      description: 'Export to IGES format',
    },

    params: {
      brepMode: {
        default: 'faces',
        options: ['faces', 'shells'],
      },
      units: {
        default: 'mm',
        options: ['mm', 'cm', 'm', 'inch'],
      },
      author: {
        default: '',
      },
    },

    inputs: {
      shape: 'Shape',
    },

    outputs: {
      igesData: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'exportIGES',
        params: {
          shape: inputs.shape,
          brepMode: params.brepMode,
          units: params.units,
          author: params.author,
        },
      });

      return {
        igesData: result,
      };
    },
  };
