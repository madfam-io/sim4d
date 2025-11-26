import type { NodeDefinition } from '@sim4d/types';

interface FromCSVParams {
  delimiter: string;
  headers: boolean;
}

interface FromCSVInputs {
  csv: unknown;
}

interface FromCSVOutputs {
  data: unknown;
  headers: unknown;
}

export const DataConvertFromCSVNode: NodeDefinition<FromCSVInputs, FromCSVOutputs, FromCSVParams> =
  {
    id: 'Data::FromCSV',
    type: 'Data::FromCSV',
    category: 'Data',
    label: 'FromCSV',
    description: 'Parse CSV',
    inputs: {
      csv: {
        type: 'string',
        label: 'Csv',
        required: true,
      },
    },
    outputs: {
      data: {
        type: 'Data[][]',
        label: 'Data',
      },
      headers: {
        type: 'string[]',
        label: 'Headers',
      },
    },
    params: {
      delimiter: {
        type: 'string',
        label: 'Delimiter',
        default: ',',
      },
      headers: {
        type: 'boolean',
        label: 'Headers',
        default: true,
      },
    },
    async evaluate(context, inputs, params) {
      const results = await context.geometry.execute({
        type: 'convertFromCSV',
        params: {
          csv: inputs.csv,
          delimiter: params.delimiter,
          headers: params.headers,
        },
      });

      return {
        data: results.data,
        headers: results.headers,
      };
    },
  };
