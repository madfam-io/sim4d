import { NodeDefinition } from '@brepflow/types';

interface Params {
  units: string;
  healGeometry: boolean;
  precision: number;
  mergeSurfaces: boolean;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  shapes: Shape[];
  metadata: Properties;
  units: string;
}

export const STEPImportNode: NodeDefinition<STEPImportInputs, STEPImportOutputs, STEPImportParams> =
  {
    type: 'Interoperability::STEPImport',
    category: 'Interoperability',
    subcategory: 'Import',

    metadata: {
      label: 'STEPImport',
      description: 'Import STEP (.stp) CAD files',
    },

    params: {
      units: {
        default: 'auto',
        options: ['auto', 'mm', 'cm', 'm', 'inch', 'ft'],
      },
      healGeometry: {
        default: true,
      },
      precision: {
        default: 0.01,
        min: 0.001,
        max: 1,
      },
      mergeSurfaces: {
        default: false,
      },
    },

    inputs: {
      filePath: 'string',
    },

    outputs: {
      shapes: 'Shape[]',
      metadata: 'Properties',
      units: 'string',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'stepImport',
        params: {
          filePath: inputs.filePath,
          units: params.units,
          healGeometry: params.healGeometry,
          precision: params.precision,
          mergeSurfaces: params.mergeSurfaces,
        },
      });

      return {
        shapes: result,
        metadata: result,
        units: result,
      };
    },
  };
