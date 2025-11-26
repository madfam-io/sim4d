import type { NodeDefinition } from '@sim4d/types';

interface ExportSVGParams {
  projection: string;
  width: number;
  height: number;
  strokeWidth: number;
  fillOpacity: number;
}

interface ExportSVGInputs {
  shapes: unknown;
}

interface ExportSVGOutputs {
  svgData: unknown;
}

export const IODrawingExportSVGNode: NodeDefinition<
  ExportSVGInputs,
  ExportSVGOutputs,
  ExportSVGParams
> = {
  id: 'IO::ExportSVG',
  category: 'IO',
  label: 'ExportSVG',
  description: 'Export to SVG format',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
  },
  outputs: {
    svgData: {
      type: 'string',
      label: 'Svg Data',
    },
  },
  params: {
    projection: {
      type: 'enum',
      label: 'Projection',
      default: 'top',
      options: ['top', 'front', 'right', 'iso'],
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 800,
      min: 100,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 600,
      min: 100,
      max: 10000,
    },
    strokeWidth: {
      type: 'number',
      label: 'Stroke Width',
      default: 1,
      min: 0.1,
      max: 10,
    },
    fillOpacity: {
      type: 'number',
      label: 'Fill Opacity',
      default: 0.3,
      min: 0,
      max: 1,
    },
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
