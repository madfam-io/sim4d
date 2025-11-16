import type { NodeDefinition } from '@brepflow/types';

interface ExportBREPParams {
  binary: boolean;
}

interface ExportBREPInputs {
  shape: unknown;
}

interface ExportBREPOutputs {
  brepData: unknown;
}

export const IOCADExportBREPNode: NodeDefinition<
  ExportBREPInputs,
  ExportBREPOutputs,
  ExportBREPParams
> = {
  id: 'IO::ExportBREP',
  type: 'IO::ExportBREP',
  category: 'IO',
  label: 'ExportBREP',
  description: 'Export to BREP format',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    brepData: {
      type: 'Data',
      label: 'Brep Data',
    },
  },
  params: {
    binary: {
      type: 'boolean',
      label: 'Binary',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportBREP',
      params: {
        shape: inputs.shape,
        binary: params.binary,
      },
    });

    return {
      brepData: result,
    };
  },
};
