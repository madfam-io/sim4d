import { NodeDefinition } from '@brepflow/types';

interface Params {
  inclueBendLines: boolean;
  includeFormingTools: boolean;
  layerMapping: string;
}
interface Inputs {
  flatPattern: Shape;
  annotations?: Data;
}
interface Outputs {
  dxfData: Data;
}

export const ExportDXFNode: NodeDefinition<ExportDXFInputs, ExportDXFOutputs, ExportDXFParams> = {
  type: 'SheetMetal::ExportDXF',
  category: 'SheetMetal',
  subcategory: 'Unfold',

  metadata: {
    label: 'ExportDXF',
    description: 'Export flat pattern to DXF',
  },

  params: {
    inclueBendLines: {
      default: true,
    },
    includeFormingTools: {
      default: true,
    },
    layerMapping: {
      default: 'by-type',
      options: ['by-feature', 'by-type', 'single'],
    },
  },

  inputs: {
    flatPattern: 'Shape',
    annotations: 'Data',
  },

  outputs: {
    dxfData: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetExportDXF',
      params: {
        flatPattern: inputs.flatPattern,
        annotations: inputs.annotations,
        inclueBendLines: params.inclueBendLines,
        includeFormingTools: params.includeFormingTools,
        layerMapping: params.layerMapping,
      },
    });

    return {
      dxfData: result,
    };
  },
};
