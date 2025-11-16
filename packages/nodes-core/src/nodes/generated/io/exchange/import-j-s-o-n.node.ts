import { NodeDefinition } from '@brepflow/types';

interface Params {
  format: string;
}
interface Inputs {
  jsonData: Data;
}
interface Outputs {
  shapes: Shape[];
  metadata: Data;
}

export const ImportJSONNode: NodeDefinition<ImportJSONInputs, ImportJSONOutputs, ImportJSONParams> =
  {
    type: 'IO::ImportJSON',
    category: 'IO',
    subcategory: 'Exchange',

    metadata: {
      label: 'ImportJSON',
      description: 'Import geometry from JSON',
    },

    params: {
      format: {
        default: 'brepflow',
        options: ['brepflow', 'three', 'custom'],
      },
    },

    inputs: {
      jsonData: 'Data',
    },

    outputs: {
      shapes: 'Shape[]',
      metadata: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'importJSON',
        params: {
          jsonData: inputs.jsonData,
          format: params.format,
        },
      });

      return {
        shapes: result,
        metadata: result,
      };
    },
  };
