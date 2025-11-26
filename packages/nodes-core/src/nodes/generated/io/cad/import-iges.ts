import type { NodeDefinition } from '@sim4d/types';

interface ImportIGESParams {
  readSurfaces: boolean;
  readCurves: boolean;
  sequence: boolean;
}

interface ImportIGESInputs {
  fileData: unknown;
}

interface ImportIGESOutputs {
  shape: unknown;
}

export const IOCADImportIGESNode: NodeDefinition<
  ImportIGESInputs,
  ImportIGESOutputs,
  ImportIGESParams
> = {
  id: 'IO::ImportIGES',
  type: 'IO::ImportIGES',
  category: 'IO',
  label: 'ImportIGES',
  description: 'Import IGES file',
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
    readSurfaces: {
      type: 'boolean',
      label: 'Read Surfaces',
      default: true,
    },
    readCurves: {
      type: 'boolean',
      label: 'Read Curves',
      default: true,
    },
    sequence: {
      type: 'boolean',
      label: 'Sequence',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importIGES',
      params: {
        fileData: inputs.fileData,
        readSurfaces: params.readSurfaces,
        readCurves: params.readCurves,
        sequence: params.sequence,
      },
    });

    return {
      shape: result,
    };
  },
};
