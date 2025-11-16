import type { NodeDefinition } from '@brepflow/types';

interface ImportACISParams {
  version: string;
  healGeometry: boolean;
}

interface ImportACISInputs {
  fileData: unknown;
}

interface ImportACISOutputs {
  shape: unknown;
}

export const IOCADImportACISNode: NodeDefinition<
  ImportACISInputs,
  ImportACISOutputs,
  ImportACISParams
> = {
  id: 'IO::ImportACIS',
  category: 'IO',
  label: 'ImportACIS',
  description: 'Import ACIS SAT file',
  inputs: {
    fileData: {
      type: 'Data',
      label: 'File Data',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    version: {
      type: 'string',
      label: 'Version',
      default: 'auto',
    },
    healGeometry: {
      type: 'boolean',
      label: 'Heal Geometry',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importACIS',
      params: {
        fileData: inputs.fileData,
        version: params.version,
        healGeometry: params.healGeometry,
      },
    });

    return {
      shape: result,
    };
  },
};
