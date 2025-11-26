import { NodeDefinition } from '@sim4d/types';

interface Params {
  version: string;
  projection: string;
  hiddenLines: boolean;
}
interface Inputs {
  shapes: Shape[];
  layers?: Data;
}
interface Outputs {
  dxfData: Data;
}

export const ExportDXFNode: NodeDefinition<ExportDXFInputs, ExportDXFOutputs, ExportDXFParams> = {
  type: 'IO::ExportDXF',
  category: 'IO',
  subcategory: 'Drawing',

  metadata: {
    label: 'ExportDXF',
    description: 'Export to DXF format',
  },

  params: {
    version: {
      default: 'R2010',
      options: ['R12', 'R2000', 'R2004', 'R2007', 'R2010'],
    },
    projection: {
      default: 'top',
      options: ['top', 'front', 'right', 'iso'],
    },
    hiddenLines: {
      default: false,
    },
  },

  inputs: {
    shapes: 'Shape[]',
    layers: 'Data',
  },

  outputs: {
    dxfData: 'Data',
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
