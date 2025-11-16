import { NodeDefinition } from '@brepflow/types';

interface Params {
  format: string;
  precision: number;
  includeTopology: boolean;
}
interface Inputs {
  shapes: Shape[];
  metadata?: Data;
}
interface Outputs {
  jsonData: string;
}

export const ExportJSONNode: NodeDefinition<ExportJSONInputs, ExportJSONOutputs, ExportJSONParams> =
  {
    type: 'IO::ExportJSON',
    category: 'IO',
    subcategory: 'Exchange',

    metadata: {
      label: 'ExportJSON',
      description: 'Export geometry to JSON',
    },

    params: {
      format: {
        default: 'brepflow',
        options: ['brepflow', 'three', 'custom'],
      },
      precision: {
        default: 6,
        min: 1,
        max: 15,
        step: 1,
      },
      includeTopology: {
        default: true,
      },
    },

    inputs: {
      shapes: 'Shape[]',
      metadata: 'Data',
    },

    outputs: {
      jsonData: 'string',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'exportJSON',
        params: {
          shapes: inputs.shapes,
          metadata: inputs.metadata,
          format: params.format,
          precision: params.precision,
          includeTopology: params.includeTopology,
        },
      });

      return {
        jsonData: result,
      };
    },
  };
