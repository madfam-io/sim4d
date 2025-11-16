import type { NodeDefinition } from '@brepflow/types';

interface IGESExportParams {
  units: string;
  precision: number;
  writeMode: string;
}

interface IGESExportInputs {
  shapes: unknown;
  filePath: unknown;
}

interface IGESExportOutputs {
  success: unknown;
  entityCount: unknown;
}

export const InteroperabilityExportIGESExportNode: NodeDefinition<
  IGESExportInputs,
  IGESExportOutputs,
  IGESExportParams
> = {
  id: 'Interoperability::IGESExport',
  category: 'Interoperability',
  label: 'IGESExport',
  description: 'Export geometry to IGES format',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    entityCount: {
      type: 'number',
      label: 'Entity Count',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
    precision: {
      type: 'number',
      label: 'Precision',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    writeMode: {
      type: 'enum',
      label: 'Write Mode',
      default: 'brep',
      options: ['brep', 'faces'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'igesExport',
      params: {
        shapes: inputs.shapes,
        filePath: inputs.filePath,
        units: params.units,
        precision: params.precision,
        writeMode: params.writeMode,
      },
    });

    return {
      success: results.success,
      entityCount: results.entityCount,
    };
  },
};
