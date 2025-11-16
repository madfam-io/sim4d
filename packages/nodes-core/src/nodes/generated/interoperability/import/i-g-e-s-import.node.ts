import { NodeDefinition } from '@brepflow/types';

interface Params {
  units: string;
  readFailed: boolean;
  oneObject: boolean;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  shapes: Shape[];
  curves: Wire[];
  surfaces: Face[];
  metadata: Properties;
}

export const IGESImportNode: NodeDefinition<IGESImportInputs, IGESImportOutputs, IGESImportParams> =
  {
    type: 'Interoperability::IGESImport',
    category: 'Interoperability',
    subcategory: 'Import',

    metadata: {
      label: 'IGESImport',
      description: 'Import IGES (.igs) CAD files',
    },

    params: {
      units: {
        default: 'auto',
        options: ['auto', 'mm', 'cm', 'm', 'inch'],
      },
      readFailed: {
        default: false,
        description: 'Read failed entities',
      },
      oneObject: {
        default: false,
        description: 'Merge into one shape',
      },
    },

    inputs: {
      filePath: 'string',
    },

    outputs: {
      shapes: 'Shape[]',
      curves: 'Wire[]',
      surfaces: 'Face[]',
      metadata: 'Properties',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'igesImport',
        params: {
          filePath: inputs.filePath,
          units: params.units,
          readFailed: params.readFailed,
          oneObject: params.oneObject,
        },
      });

      return {
        shapes: result,
        curves: result,
        surfaces: result,
        metadata: result,
      };
    },
  };
