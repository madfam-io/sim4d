import { NodeDefinition } from '@sim4d/types';

interface Params {
  importAs: string;
  layerFilter: string;
  units: string;
}
interface Inputs {
  fileData: Data;
}
interface Outputs {
  wires: Wire[];
  layers: Data;
}

export const ImportDXFNode: NodeDefinition<ImportDXFInputs, ImportDXFOutputs, ImportDXFParams> = {
  type: 'IO::ImportDXF',
  category: 'IO',
  subcategory: 'Drawing',

  metadata: {
    label: 'ImportDXF',
    description: 'Import DXF drawing',
  },

  params: {
    importAs: {
      default: '2d',
      options: ['2d', '3d', 'both'],
    },
    layerFilter: {
      default: '*',
    },
    units: {
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
  },

  inputs: {
    fileData: 'Data',
  },

  outputs: {
    wires: 'Wire[]',
    layers: 'Data',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'importDXF',
      params: {
        fileData: inputs.fileData,
        importAs: params.importAs,
        layerFilter: params.layerFilter,
        units: params.units,
      },
    });

    return {
      wires: result,
      layers: result,
    };
  },
};
