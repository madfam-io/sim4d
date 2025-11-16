import type { NodeDefinition } from '@brepflow/types';

interface ThreeMFExportParams {
  units: string;
  includeColors: boolean;
  compression: boolean;
}

interface ThreeMFExportInputs {
  models: unknown;
  filePath: unknown;
}

interface ThreeMFExportOutputs {
  success: unknown;
  modelCount: unknown;
}

export const InteroperabilityExportThreeMFExportNode: NodeDefinition<
  ThreeMFExportInputs,
  ThreeMFExportOutputs,
  ThreeMFExportParams
> = {
  id: 'Interoperability::ThreeMFExport',
  type: 'Interoperability::ThreeMFExport',
  category: 'Interoperability',
  label: 'ThreeMFExport',
  description: 'Export to 3D Manufacturing Format',
  inputs: {
    models: {
      type: 'Shape[]',
      label: 'Models',
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
    modelCount: {
      type: 'number',
      label: 'Model Count',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm'],
    },
    includeColors: {
      type: 'boolean',
      label: 'Include Colors',
      default: true,
    },
    compression: {
      type: 'boolean',
      label: 'Compression',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'threeMFExport',
      params: {
        models: inputs.models,
        filePath: inputs.filePath,
        units: params.units,
        includeColors: params.includeColors,
        compression: params.compression,
      },
    });

    return {
      success: results.success,
      modelCount: results.modelCount,
    };
  },
};
