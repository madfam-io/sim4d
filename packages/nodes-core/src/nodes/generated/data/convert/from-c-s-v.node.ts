import { NodeDefinition } from '@brepflow/types';

interface Params {
  delimiter: string;
  headers: boolean;
}
interface Inputs {
  csv: string;
}
interface Outputs {
  data: Data[][];
  headers: string[];
}

export const FromCSVNode: NodeDefinition<FromCSVInputs, FromCSVOutputs, FromCSVParams> = {
  type: 'Data::FromCSV',
  category: 'Data',
  subcategory: 'Convert',

  metadata: {
    label: 'FromCSV',
    description: 'Parse CSV',
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
    csv: 'string',
  },

  outputs: {
    data: 'Data[][]',
    headers: 'string[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'convertFromCSV',
      params: {
        csv: inputs.csv,
        delimiter: params.delimiter,
        headers: params.headers,
      },
    });

    return {
      data: result,
      headers: result,
    };
  },
};
