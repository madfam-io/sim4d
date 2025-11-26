import { NodeDefinition } from '@sim4d/types';

interface Params {
  delimiter: string;
  hasHeader: boolean;
  encoding: string;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  data: Properties[];
  headers: string[];
  rowCount: number;
}

export const CSVReaderNode: NodeDefinition<CSVReaderInputs, CSVReaderOutputs, CSVReaderParams> = {
  type: 'Interoperability::CSVReader',
  category: 'Interoperability',
  subcategory: 'Data',

  metadata: {
    label: 'CSVReader',
    description: 'Read CSV data files',
  },

  params: {
    delimiter: {
      default: ',',
      description: 'Field delimiter',
    },
    hasHeader: {
      default: true,
    },
    encoding: {
      default: 'utf-8',
      options: ['utf-8', 'ascii', 'latin1'],
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    data: 'Properties[]',
    headers: 'string[]',
    rowCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'csvReader',
      params: {
        filePath: inputs.filePath,
        delimiter: params.delimiter,
        hasHeader: params.hasHeader,
        encoding: params.encoding,
      },
    });

    return {
      data: result,
      headers: result,
      rowCount: result,
    };
  },
};
