import { NodeDefinition } from '@brepflow/types';

interface Params {
  version: string;
  units: string;
  precision: number;
  writeMode: string;
}
interface Inputs {
  shapes: Shape[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  fileSize: number;
  exportLog: string[];
}

export const STEPExportNode: NodeDefinition<STEPExportInputs, STEPExportOutputs, STEPExportParams> =
  {
    type: 'Interoperability::STEPExport',
    category: 'Interoperability',
    subcategory: 'Export',

    metadata: {
      label: 'STEPExport',
      description: 'Export geometry to STEP format',
    },

    params: {
      version: {
        default: 'AP214',
        options: ['AP203', 'AP214', 'AP242'],
      },
      units: {
        default: 'mm',
        options: ['mm', 'cm', 'm', 'inch'],
      },
      precision: {
        default: 0.01,
        min: 0.001,
        max: 1,
      },
      writeMode: {
        default: 'manifold',
        options: ['manifold', 'wireframe', 'shell'],
      },
    },

    inputs: {
      shapes: 'Shape[]',
      filePath: 'string',
    },

    outputs: {
      success: 'boolean',
      fileSize: 'number',
      exportLog: 'string[]',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
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
        success: result,
        fileSize: result,
        exportLog: result,
      };
    },
  };
