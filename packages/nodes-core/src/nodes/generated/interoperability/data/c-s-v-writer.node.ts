import { NodeDefinition } from '@brepflow/types';

interface Params {
  delimiter: string;
  includeHeader: boolean;
  encoding: string;
}
interface Inputs {
  data: Properties[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  rowsWritten: number;
}

export const CSVWriterNode: NodeDefinition<CSVWriterInputs, CSVWriterOutputs, CSVWriterParams> = {
  type: 'Interoperability::CSVWriter',
  category: 'Interoperability',
  subcategory: 'Data',

  metadata: {
    label: 'CSVWriter',
    description: 'Write data to CSV files',
  },

  params: {
    delimiter: {
      default: ',',
    },
    includeHeader: {
      default: true,
    },
    encoding: {
      default: 'utf-8',
      options: ['utf-8', 'ascii'],
    },
  },

  inputs: {
    data: 'Properties[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    rowsWritten: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'csvWriter',
      params: {
        data: inputs.data,
        filePath: inputs.filePath,
        delimiter: params.delimiter,
        includeHeader: params.includeHeader,
        encoding: params.encoding,
      },
    });

    return {
      success: result,
      rowsWritten: result,
    };
  },
};
