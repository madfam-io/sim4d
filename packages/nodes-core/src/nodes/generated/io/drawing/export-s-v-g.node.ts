import { NodeDefinition } from '@sim4d/types';

interface Params {
  projection: string;
  width: number;
  height: number;
  strokeWidth: number;
  fillOpacity: number;
}
interface Inputs {
  shapes: Shape[];
}
interface Outputs {
  svgData: string;
}

export const ExportSVGNode: NodeDefinition<ExportSVGInputs, ExportSVGOutputs, ExportSVGParams> = {
  type: 'IO::ExportSVG',
  category: 'IO',
  subcategory: 'Drawing',

  metadata: {
    label: 'ExportSVG',
    description: 'Export to SVG format',
  },

  params: {
    projection: {
      default: 'top',
      options: ['top', 'front', 'right', 'iso'],
    },
    width: {
      default: 800,
      min: 100,
      max: 10000,
    },
    height: {
      default: 600,
      min: 100,
      max: 10000,
    },
    strokeWidth: {
      default: 1,
      min: 0.1,
      max: 10,
    },
    fillOpacity: {
      default: 0.3,
      min: 0,
      max: 1,
    },
  },

  inputs: {
    shapes: 'Shape[]',
  },

  outputs: {
    svgData: 'string',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'exportSVG',
      params: {
        shapes: inputs.shapes,
        projection: params.projection,
        width: params.width,
        height: params.height,
        strokeWidth: params.strokeWidth,
        fillOpacity: params.fillOpacity,
      },
    });

    return {
      svgData: result,
    };
  },
};
