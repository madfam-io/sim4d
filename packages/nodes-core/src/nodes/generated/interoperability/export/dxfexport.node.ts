import type { NodeDefinition } from '@sim4d/types';

interface DXFExportParams {
  version: string;
  units: string;
  layerName: string;
}

interface DXFExportInputs {
  curves: unknown;
  filePath: unknown;
}

interface DXFExportOutputs {
  success: unknown;
  entityCount: unknown;
}

export const InteroperabilityExportDXFExportNode: NodeDefinition<
  DXFExportInputs,
  DXFExportOutputs,
  DXFExportParams
> = {
  id: 'Interoperability::DXFExport',
  category: 'Interoperability',
  label: 'DXFExport',
  description: 'Export 2D geometry to DXF format',
  inputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
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
    version: {
      type: 'enum',
      label: 'Version',
      default: '2000',
      options: ['R12', 'R14', '2000', '2004', '2007'],
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
    layerName: {
      type: 'string',
      label: 'Layer Name',
      default: 'Sim4D',
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'dxfExport',
      params: {
        curves: inputs.curves,
        filePath: inputs.filePath,
        version: params.version,
        units: params.units,
        layerName: params.layerName,
      },
    });

    return {
      success: results.success,
      entityCount: results.entityCount,
    };
  },
};
