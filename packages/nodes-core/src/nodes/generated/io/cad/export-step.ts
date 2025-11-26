import type { NodeDefinition } from '@sim4d/types';

interface ExportSTEPParams {
  version: string;
  writeColors: boolean;
  writeNames: boolean;
  writeLayers: boolean;
  units: string;
}

interface ExportSTEPInputs {
  shape: unknown;
  metadata?: unknown;
}

interface ExportSTEPOutputs {
  stepData: unknown;
}

export const IOCADExportSTEPNode: NodeDefinition<
  ExportSTEPInputs,
  ExportSTEPOutputs,
  ExportSTEPParams
> = {
  id: 'IO::ExportSTEP',
  type: 'IO::ExportSTEP',
  category: 'IO',
  label: 'ExportSTEP',
  description: 'Export to STEP format',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    metadata: {
      type: 'Data',
      label: 'Metadata',
      optional: true,
    },
  },
  outputs: {
    stepData: {
      type: 'Data',
      label: 'Step Data',
    },
  },
  params: {
    version: {
      type: 'enum',
      label: 'Version',
      default: 'AP214',
      options: ['AP203', 'AP214', 'AP242'],
    },
    writeColors: {
      type: 'boolean',
      label: 'Write Colors',
      default: true,
    },
    writeNames: {
      type: 'boolean',
      label: 'Write Names',
      default: true,
    },
    writeLayers: {
      type: 'boolean',
      label: 'Write Layers',
      default: true,
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
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
