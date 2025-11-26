import type { NodeDefinition } from '@sim4d/types';

interface ExportDXFParams {
  version: string;
  projection: string;
  hiddenLines: boolean;
}

interface ExportDXFInputs {
  shapes: unknown;
  layers?: unknown;
}

interface ExportDXFOutputs {
  dxfData: unknown;
}

export const IODrawingExportDXFNode: NodeDefinition<
  ExportDXFInputs,
  ExportDXFOutputs,
  ExportDXFParams
> = {
  id: 'IO::ExportDXF',
  type: 'IO::ExportDXF',
  category: 'IO',
  label: 'ExportDXF',
  description: 'Export to DXF format',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
    layers: {
      type: 'Data',
      label: 'Layers',
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
    version: {
      type: 'enum',
      label: 'Version',
      default: 'R2010',
      options: ['R12', 'R2000', 'R2004', 'R2007', 'R2010'],
    },
    projection: {
      type: 'enum',
      label: 'Projection',
      default: 'top',
      options: ['top', 'front', 'right', 'iso'],
    },
    hiddenLines: {
      type: 'boolean',
      label: 'Hidden Lines',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportDXF',
      params: {
        shapes: inputs.shapes,
        layers: inputs.layers,
        version: params.version,
        projection: params.projection,
        hiddenLines: params.hiddenLines,
      },
    });

    return {
      dxfData: result,
    };
  },
};
