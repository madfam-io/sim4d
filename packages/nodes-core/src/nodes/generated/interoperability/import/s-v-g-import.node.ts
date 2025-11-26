import { NodeDefinition } from '@sim4d/types';

interface Params {
  scale: number;
  tolerance: number;
  flatten: boolean;
}
interface Inputs {
  filePath: string;
}
interface Outputs {
  curves: Wire[];
  closed: Wire[];
  open: Wire[];
}

export const SVGImportNode: NodeDefinition<SVGImportInputs, SVGImportOutputs, SVGImportParams> = {
  type: 'Interoperability::SVGImport',
  category: 'Interoperability',
  subcategory: 'Import',

  metadata: {
    label: 'SVGImport',
    description: 'Import SVG vector graphics',
  },

  params: {
    scale: {
      default: 1,
      min: 0.001,
      max: 1000,
    },
    tolerance: {
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    flatten: {
      default: true,
      description: 'Flatten to single plane',
    },
  },

  inputs: {
    filePath: 'string',
  },

  outputs: {
    curves: 'Wire[]',
    closed: 'Wire[]',
    open: 'Wire[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'svgImport',
      params: {
        filePath: inputs.filePath,
        scale: params.scale,
        tolerance: params.tolerance,
        flatten: params.flatten,
      },
    });

    return {
      curves: result,
      closed: result,
      open: result,
    };
  },
};
