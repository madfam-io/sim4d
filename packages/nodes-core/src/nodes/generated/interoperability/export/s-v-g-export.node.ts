import { NodeDefinition } from '@sim4d/types';

interface Params {
  scale: number;
  strokeWidth: number;
  viewBox: boolean;
}
interface Inputs {
  curves: Wire[];
  filePath: string;
}
interface Outputs {
  success: boolean;
  dimensions: Vector;
}

export const SVGExportNode: NodeDefinition<SVGExportInputs, SVGExportOutputs, SVGExportParams> = {
  type: 'Interoperability::SVGExport',
  category: 'Interoperability',
  subcategory: 'Export',

  metadata: {
    label: 'SVGExport',
    description: 'Export 2D curves to SVG format',
  },

  params: {
    scale: {
      default: 1,
      min: 0.001,
      max: 1000,
    },
    strokeWidth: {
      default: 1,
      min: 0.1,
      max: 10,
    },
    viewBox: {
      default: true,
    },
  },

  inputs: {
    curves: 'Wire[]',
    filePath: 'string',
  },

  outputs: {
    success: 'boolean',
    dimensions: 'Vector',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'svgExport',
      params: {
        curves: inputs.curves,
        filePath: inputs.filePath,
        scale: params.scale,
        strokeWidth: params.strokeWidth,
        viewBox: params.viewBox,
      },
    });

    return {
      success: result,
      dimensions: result,
    };
  },
};
