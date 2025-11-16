import { NodeDefinition } from '@brepflow/types';

interface Params {
  units: string;
  layers: string;
  explodeBlocks: boolean;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  curves: Wire[];
  points: Point[];
  texts: Properties[];
  layers: string[];
}

export const DXFImportNode: NodeDefinition<DXFImportInputs, DXFImportOutputs, DXFImportParams> = {
  type: 'Interoperability::DXFImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: 'DXFImport',
    description: 'Import DXF 2D drawing files',
  },

  params: {
    units: {
      default: 'auto',
      options: ['auto', 'mm', 'cm', 'm', 'inch'],
    },
    layers: {
      default: 'all',
      description: 'Comma-separated layer names',
    },
    explodeBlocks: {
      default: false,
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    curves: 'Wire[]',
    points: 'Point[]',
    texts: 'Properties[]',
    layers: 'string[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'dxfImport',
      params: {
        filePath: inputs.filePath,
        units: params.units,
        layers: params.layers,
        explodeBlocks: params.explodeBlocks,
      },
    });

    return {
      curves: result,
      points: result,
      texts: result,
      layers: result,
    };
  },
};
