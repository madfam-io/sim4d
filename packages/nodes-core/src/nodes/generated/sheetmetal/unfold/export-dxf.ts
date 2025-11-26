import type { NodeDefinition } from '@sim4d/types';

interface ExportDXFParams {
  inclueBendLines: boolean;
  includeFormingTools: boolean;
  layerMapping: string;
}

interface ExportDXFInputs {
  flatPattern: unknown;
  annotations?: unknown;
}

interface ExportDXFOutputs {
  dxfData: unknown;
}

export const SheetMetalUnfoldExportDXFNode: NodeDefinition<
  ExportDXFInputs,
  ExportDXFOutputs,
  ExportDXFParams
> = {
  id: 'SheetMetal::ExportDXF',
  type: 'SheetMetal::ExportDXF',
  category: 'SheetMetal',
  label: 'ExportDXF',
  description: 'Export flat pattern to DXF',
  inputs: {
    flatPattern: {
      type: 'Shape',
      label: 'Flat Pattern',
      required: true,
    },
    annotations: {
      type: 'Data',
      label: 'Annotations',
      optional: true,
    },
  },
  outputs: {
    dxfData: {
      type: 'Data',
      label: 'Dxf Data',
    },
  },
  params: {
    inclueBendLines: {
      type: 'boolean',
      label: 'Inclue Bend Lines',
      default: true,
    },
    includeFormingTools: {
      type: 'boolean',
      label: 'Include Forming Tools',
      default: true,
    },
    layerMapping: {
      type: 'enum',
      label: 'Layer Mapping',
      default: 'by-type',
      options: ['by-feature', 'by-type', 'single'],
    },
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
