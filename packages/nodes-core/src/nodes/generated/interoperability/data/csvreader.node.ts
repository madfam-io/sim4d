import type { NodeDefinition } from '@sim4d/types';

interface CSVReaderParams {
  delimiter: string;
  hasHeader: boolean;
  encoding: string;
}

interface CSVReaderInputs {
  filePath: unknown;
}

interface CSVReaderOutputs {
  data: unknown;
  headers: unknown;
  rowCount: unknown;
}

export const InteroperabilityDataCSVReaderNode: NodeDefinition<
  CSVReaderInputs,
  CSVReaderOutputs,
  CSVReaderParams
> = {
  id: 'Interoperability::CSVReader',
  category: 'Interoperability',
  label: 'CSVReader',
  description: 'Read CSV data files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    data: {
      type: 'Properties[]',
      label: 'Data',
    },
    headers: {
      type: 'string[]',
      label: 'Headers',
    },
    rowCount: {
      type: 'number',
      label: 'Row Count',
    },
  },
  params: {
    delimiter: {
      type: 'string',
      label: 'Delimiter',
      default: ',',
    },
    hasHeader: {
      type: 'boolean',
      label: 'Has Header',
      default: true,
    },
    encoding: {
      type: 'enum',
      label: 'Encoding',
      default: 'utf-8',
      options: ['utf-8', 'ascii', 'latin1'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'csvReader',
      params: {
        filePath: inputs.filePath,
        delimiter: params.delimiter,
        hasHeader: params.hasHeader,
        encoding: params.encoding,
      },
    });

    return {
      data: results.data,
      headers: results.headers,
      rowCount: results.rowCount,
    };
  },
};
