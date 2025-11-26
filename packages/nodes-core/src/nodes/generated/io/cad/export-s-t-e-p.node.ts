import { NodeDefinition } from '@sim4d/types';

interface Params {
  version: string;
  writeColors: boolean;
  writeNames: boolean;
  writeLayers: boolean;
  units: string;
}
interface Inputs {
  shape: Shape;
  metadata?: Data;
}
interface Outputs {
  stepData: Data;
}

export const ExportSTEPNode: NodeDefinition<ExportSTEPInputs, ExportSTEPOutputs, ExportSTEPParams> =
  {
    type: 'IO::ExportSTEP',
    category: 'IO',
    subcategory: 'CAD',

    metadata: {
      label: 'ExportSTEP',
      description: 'Export to STEP format',
    },

    params: {
      version: {
        default: 'AP214',
        options: ['AP203', 'AP214', 'AP242'],
      },
      writeColors: {
        default: true,
      },
      writeNames: {
        default: true,
      },
      writeLayers: {
        default: true,
      },
      units: {
        default: 'mm',
        options: ['mm', 'cm', 'm', 'inch'],
      },
    },

    inputs: {
      shape: 'Shape',
      metadata: 'Data',
    },

    outputs: {
      stepData: 'Data',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'exportSTEP',
        params: {
          shape: inputs.shape,
          metadata: inputs.metadata,
          version: params.version,
          writeColors: params.writeColors,
          writeNames: params.writeNames,
          writeLayers: params.writeLayers,
          units: params.units,
        },
      });

      return {
        stepData: result,
      };
    },
  };
