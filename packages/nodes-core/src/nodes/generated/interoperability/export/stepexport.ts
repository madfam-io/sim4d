import type { NodeDefinition } from '@brepflow/types';

interface STEPExportParams {
  version: string;
  units: string;
  precision: number;
  writeMode: string;
}

interface STEPExportInputs {
  shapes: unknown;
  filePath: unknown;
}

interface STEPExportOutputs {
  success: unknown;
  fileSize: unknown;
  exportLog: unknown;
}

export const InteroperabilityExportSTEPExportNode: NodeDefinition<
  STEPExportInputs,
  STEPExportOutputs,
  STEPExportParams
> = {
  id: 'Interoperability::STEPExport',
  type: 'Interoperability::STEPExport',
  category: 'Interoperability',
  label: 'STEPExport',
  description: 'Export geometry to STEP format',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
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
    fileSize: {
      type: 'number',
      label: 'File Size',
    },
    exportLog: {
      type: 'string[]',
      label: 'Export Log',
    },
  },
  params: {
    version: {
      type: 'enum',
      label: 'Version',
      default: 'AP214',
      options: ['AP203', 'AP214', 'AP242'],
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
    precision: {
      type: 'number',
      label: 'Precision',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    writeMode: {
      type: 'enum',
      label: 'Write Mode',
      default: 'manifold',
      options: ['manifold', 'wireframe', 'shell'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'stepExport',
      params: {
        shapes: inputs.shapes,
        filePath: inputs.filePath,
        version: params.version,
        units: params.units,
        precision: params.precision,
        writeMode: params.writeMode,
      },
    });

    return {
      success: results.success,
      fileSize: results.fileSize,
      exportLog: results.exportLog,
    };
  },
};
