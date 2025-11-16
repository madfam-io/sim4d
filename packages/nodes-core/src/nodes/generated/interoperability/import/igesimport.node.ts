import type { NodeDefinition } from '@brepflow/types';

interface IGESImportParams {
  units: string;
  readFailed: boolean;
  oneObject: boolean;
}

interface IGESImportInputs {
  filePath: unknown;
}

interface IGESImportOutputs {
  shapes: unknown;
  curves: unknown;
  surfaces: unknown;
  metadata: unknown;
}

export const InteroperabilityImportIGESImportNode: NodeDefinition<
  IGESImportInputs,
  IGESImportOutputs,
  IGESImportParams
> = {
  id: 'Interoperability::IGESImport',
  category: 'Interoperability',
  label: 'IGESImport',
  description: 'Import IGES (.igs) CAD files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
    },
    curves: {
      type: 'Wire[]',
      label: 'Curves',
    },
    surfaces: {
      type: 'Face[]',
      label: 'Surfaces',
    },
    metadata: {
      type: 'Properties',
      label: 'Metadata',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm', 'inch'],
    },
    readFailed: {
      type: 'boolean',
      label: 'Read Failed',
      default: false,
    },
    oneObject: {
      type: 'boolean',
      label: 'One Object',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'igesImport',
      params: {
        filePath: inputs.filePath,
        units: params.units,
        readFailed: params.readFailed,
        oneObject: params.oneObject,
      },
    });

    return {
      shapes: results.shapes,
      curves: results.curves,
      surfaces: results.surfaces,
      metadata: results.metadata,
    };
  },
};
