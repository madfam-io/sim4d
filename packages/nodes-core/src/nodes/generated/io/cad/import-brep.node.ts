import type { NodeDefinition } from '@sim4d/types';

interface ImportBREPParams {
  version: string;
}

interface ImportBREPInputs {
  fileData: unknown;
}

interface ImportBREPOutputs {
  shape: unknown;
}

export const IOCADImportBREPNode: NodeDefinition<
  ImportBREPInputs,
  ImportBREPOutputs,
  ImportBREPParams
> = {
  id: 'IO::ImportBREP',
  category: 'IO',
  label: 'ImportBREP',
  description: 'Import OpenCASCADE BREP',
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
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importBREP',
      params: {
        fileData: inputs.fileData,
        version: params.version,
      },
    });

    return {
      shape: result,
    };
  },
};
