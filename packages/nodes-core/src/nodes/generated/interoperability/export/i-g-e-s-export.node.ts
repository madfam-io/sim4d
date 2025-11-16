import { NodeDefinition } from '@brepflow/types';

interface Params {
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
  entityCount: number;
}

export const IGESExportNode: NodeDefinition<IGESExportInputs, IGESExportOutputs, IGESExportParams> =
  {
    type: 'Interoperability::IGESExport',
    category: 'Interoperability',
    subcategory: 'Export',

    metadata: {
      label: 'IGESExport',
      description: 'Export geometry to IGES format',
    },

    params: {
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
        default: 'brep',
        options: ['brep', 'faces'],
      },
    },

    inputs: {
      shapes: 'Shape[]',
      filePath: 'string',
    },

    outputs: {
      success: 'boolean',
      entityCount: 'number',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'igesExport',
        params: {
          shapes: inputs.shapes,
          filePath: inputs.filePath,
          units: params.units,
          precision: params.precision,
          writeMode: params.writeMode,
        },
      });

      return {
        success: result,
        entityCount: result,
      };
    },
  };
