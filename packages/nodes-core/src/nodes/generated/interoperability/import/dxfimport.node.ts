import type { NodeDefinition } from '@sim4d/types';

interface DXFImportParams {
  units: string;
  layers: string;
  explodeBlocks: boolean;
}

interface DXFImportInputs {
  filePath: unknown;
}

interface DXFImportOutputs {
  curves: unknown;
  points: Array<[number, number, number]>;
  texts: unknown;
  layers: unknown;
}

export const InteroperabilityImportDXFImportNode: NodeDefinition<
  DXFImportInputs,
  DXFImportOutputs,
  DXFImportParams
> = {
  id: 'Interoperability::DXFImport',
  category: 'Interoperability',
  label: 'DXFImport',
  description: 'Import DXF 2D drawing files',
  inputs: {
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
    },
    points: {
      type: 'Point[]',
      label: 'Points',
    },
    texts: {
      type: 'Properties[]',
      label: 'Texts',
    },
    layers: {
      type: 'string[]',
      label: 'Layers',
    },
  },
  params: {
    units: {
      type: 'enum',
      label: 'Units',
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm', 'inch'],
    },
    layers: {
      type: 'string',
      label: 'Layers',
      default: 'all',
    },
    explodeBlocks: {
      type: 'boolean',
      label: 'Explode Blocks',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'dxfImport',
      params: {
        filePath: inputs.filePath,
        units: params.units,
        layers: params.layers,
        explodeBlocks: params.explodeBlocks,
      },
    });

    return {
      curves: results.curves,
      points: results.points,
      texts: results.texts,
      layers: results.layers,
    };
  },
};
