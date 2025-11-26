import type { NodeDefinition } from '@sim4d/types';

interface ExcelWriterParams {
  sheetName: string;
  includeHeader: boolean;
  startCell: string;
}

interface ExcelWriterInputs {
  data: unknown;
  filePath: unknown;
}

interface ExcelWriterOutputs {
  success: unknown;
  cellsWritten: unknown;
}

export const InteroperabilityDataExcelWriterNode: NodeDefinition<
  ExcelWriterInputs,
  ExcelWriterOutputs,
  ExcelWriterParams
> = {
  id: 'Interoperability::ExcelWriter',
  category: 'Interoperability',
  label: 'ExcelWriter',
  description: 'Write data to Excel files',
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
    cellsWritten: {
      type: 'number',
      label: 'Cells Written',
    },
  },
  params: {
    sheetName: {
      type: 'string',
      label: 'Sheet Name',
      default: 'Sheet1',
    },
    includeHeader: {
      type: 'boolean',
      label: 'Include Header',
      default: true,
    },
    startCell: {
      type: 'string',
      label: 'Start Cell',
      default: 'A1',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'excelWriter',
      params: {
        data: inputs.data,
        filePath: inputs.filePath,
        sheetName: params.sheetName,
        includeHeader: params.includeHeader,
        startCell: params.startCell,
      },
    });

    return {
      success: results.success,
      cellsWritten: results.cellsWritten,
    };
  },
};
