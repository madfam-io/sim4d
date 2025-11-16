import { NodeDefinition } from '@brepflow/types';

interface Params {
  delimiter: string;
  headers: boolean;
}
interface Inputs {
  data: Data[][];
}
interface Outputs {
  csv: string;
}

export const ToCSVNode: NodeDefinition<ToCSVInputs, ToCSVOutputs, ToCSVParams> = {
  type: 'Data::ToCSV',
  category: 'Data',
  subcategory: 'Convert',

  metadata: {
    label: 'ToCSV',
    description: 'Convert to CSV',
  },

  params: {
    delimiter: {
      default: ',',
    },
    headers: {
      default: true,
    },
  },

  inputs: {
    data: 'Data[][]',
  },

  outputs: {
    csv: 'string',
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
