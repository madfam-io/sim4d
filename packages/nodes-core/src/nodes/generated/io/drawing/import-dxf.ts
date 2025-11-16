import type { NodeDefinition } from '@brepflow/types';

interface ImportDXFParams {
  importAs: string;
  layerFilter: string;
  units: string;
}

interface ImportDXFInputs {
  fileData: unknown;
}

interface ImportDXFOutputs {
  wires: unknown;
  layers: unknown;
}

export const IODrawingImportDXFNode: NodeDefinition<
  ImportDXFInputs,
  ImportDXFOutputs,
  ImportDXFParams
> = {
  id: 'IO::ImportDXF',
  type: 'IO::ImportDXF',
  category: 'IO',
  label: 'ImportDXF',
  description: 'Import DXF drawing',
  inputs: {
    fileData: {
      type: 'Data',
      label: 'File Data',
      required: true,
    },
  },
  outputs: {
    wires: {
      type: 'Wire[]',
      label: 'Wires',
    },
    layers: {
      type: 'Data',
      label: 'Layers',
    },
  },
  params: {
    importAs: {
      type: 'enum',
      label: 'Import As',
      default: '2d',
      options: ['2d', '3d', 'both'],
    },
    layerFilter: {
      type: 'string',
      label: 'Layer Filter',
      default: '*',
    },
    units: {
      type: 'enum',
      label: 'Units',
      default: 'mm',
      options: ['mm', 'cm', 'm', 'inch'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'importDXF',
      params: {
        fileData: inputs.fileData,
        importAs: params.importAs,
        layerFilter: params.layerFilter,
        units: params.units,
      },
    });

    return {
      wires: results.wires,
      layers: results.layers,
    };
  },
};
