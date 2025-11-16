import type { NodeDefinition } from '@brepflow/types';

interface ExcelReaderParams {
  sheetName: string;
  hasHeader: boolean;
  range: string;
}

interface ExcelReaderInputs {
  filePath: unknown;
}

interface ExcelReaderOutputs {
  data: unknown;
  sheetNames: unknown;
  dimensions: unknown;
}

export const InteroperabilityDataExcelReaderNode: NodeDefinition<
  ExcelReaderInputs,
  ExcelReaderOutputs,
  ExcelReaderParams
> = {
  id: 'Interoperability::ExcelReader',
  category: 'Interoperability',
  label: 'ExcelReader',
  description: 'Read Excel spreadsheet files',
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
    sheetNames: {
      type: 'string[]',
      label: 'Sheet Names',
    },
    dimensions: {
      type: 'number[]',
      label: 'Dimensions',
    },
  },
  params: {
    sheetName: {
      type: 'string',
      label: 'Sheet Name',
      default: '',
    },
    hasHeader: {
      type: 'boolean',
      label: 'Has Header',
      default: true,
    },
    range: {
      type: 'string',
      label: 'Range',
      default: '',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'excelReader',
      params: {
        filePath: inputs.filePath,
        sheetName: params.sheetName,
        hasHeader: params.hasHeader,
        range: params.range,
      },
    });

    return {
      data: results.data,
      sheetNames: results.sheetNames,
      dimensions: results.dimensions,
    };
  },
};
