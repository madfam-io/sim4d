import type { NodeDefinition } from '@brepflow/types';

interface ExportIGESParams {
  brepMode: string;
  units: string;
  author: string;
}

interface ExportIGESInputs {
  shape: unknown;
}

interface ExportIGESOutputs {
  igesData: unknown;
}

export const IOCADExportIGESNode: NodeDefinition<
  ExportIGESInputs,
  ExportIGESOutputs,
  ExportIGESParams
> = {
  id: 'IO::ExportIGES',
  type: 'IO::ExportIGES',
  category: 'IO',
  label: 'ExportIGES',
  description: 'Export to IGES format',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    igesData: {
      type: 'Data',
      label: 'Iges Data',
    },
  },
  params: {
    brepMode: {
      type: 'enum',
      label: 'Brep Mode',
      default: 'faces',
      options: ['faces', 'shells'],
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
    author: {
      type: 'string',
      label: 'Author',
      default: '',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportIGES',
      params: {
        shape: inputs.shape,
        brepMode: params.brepMode,
        units: params.units,
        author: params.author,
      },
    });

    return {
      igesData: result,
    };
  },
};
