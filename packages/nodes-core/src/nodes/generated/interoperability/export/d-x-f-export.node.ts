import { NodeDefinition } from '@brepflow/types';

interface Params {
  version: string;
  units: string;
  layerName: string;
}
interface Inputs {
  curves: Wire[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  entityCount: number;
}

export const DXFExportNode: NodeDefinition<DXFExportInputs, DXFExportOutputs, DXFExportParams> = {
  type: 'Interoperability::DXFExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: 'DXFExport',
    description: 'Export 2D geometry to DXF format',
  },

  params: {
    version: {
      default: '2000',
      options: ['R12', 'R14', '2000', '2004', '2007'],
    },
    units: {
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
    layerName: {
      default: 'BrepFlow',
    },
  },

  inputs: {
    curves: 'Wire[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    entityCount: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      success: result,
      entityCount: result,
    };
  },
};
