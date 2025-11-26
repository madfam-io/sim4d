import type { NodeDefinition } from '@sim4d/types';

interface ToCSVParams {
  delimiter: string;
  headers: boolean;
}

interface ToCSVInputs {
  data: unknown;
}

interface ToCSVOutputs {
  csv: unknown;
}

export const DataConvertToCSVNode: NodeDefinition<ToCSVInputs, ToCSVOutputs, ToCSVParams> = {
  id: 'Data::ToCSV',
  type: 'Data::ToCSV',
  category: 'Data',
  label: 'ToCSV',
  description: 'Convert to CSV',
  inputs: {
    data: {
      type: 'Data[][]',
      label: 'Data',
      required: true,
    },
  },
  outputs: {
    csv: {
      type: 'string',
      label: 'Csv',
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
    const result = await context.geometry.execute({
      type: 'convertToCSV',
      params: {
        data: inputs.data,
        delimiter: params.delimiter,
        headers: params.headers,
      },
    });

    return {
      csv: result,
    };
  },
};
