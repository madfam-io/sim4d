import type { NodeDefinition } from '@brepflow/types';

interface CSVWriterParams {
  delimiter: string;
  includeHeader: boolean;
  encoding: string;
}

interface CSVWriterInputs {
  data: unknown;
  filePath: unknown;
}

interface CSVWriterOutputs {
  success: unknown;
  rowsWritten: unknown;
}

export const InteroperabilityDataCSVWriterNode: NodeDefinition<
  CSVWriterInputs,
  CSVWriterOutputs,
  CSVWriterParams
> = {
  id: 'Interoperability::CSVWriter',
  type: 'Interoperability::CSVWriter',
  category: 'Interoperability',
  label: 'CSVWriter',
  description: 'Write data to CSV files',
  inputs: {
    data: {
      type: 'Properties[]',
      label: 'Data',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    rowsWritten: {
      type: 'number',
      label: 'Rows Written',
    },
  },
  params: {
    delimiter: {
      type: 'string',
      label: 'Delimiter',
      default: ',',
    },
    includeHeader: {
      type: 'boolean',
      label: 'Include Header',
      default: true,
    },
    encoding: {
      type: 'enum',
      label: 'Encoding',
      default: 'utf-8',
      options: ['utf-8', 'ascii'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      success: results.success,
      rowsWritten: results.rowsWritten,
    };
  },
};
