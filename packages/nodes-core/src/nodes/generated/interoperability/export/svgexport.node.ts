import type { NodeDefinition } from '@brepflow/types';

interface SVGExportParams {
  scale: number;
  strokeWidth: number;
  viewBox: boolean;
}

interface SVGExportInputs {
  curves: unknown;
  filePath: unknown;
}

interface SVGExportOutputs {
  success: unknown;
  dimensions: [number, number, number];
}

export const InteroperabilityExportSVGExportNode: NodeDefinition<
  SVGExportInputs,
  SVGExportOutputs,
  SVGExportParams
> = {
  id: 'Interoperability::SVGExport',
  category: 'Interoperability',
  label: 'SVGExport',
  description: 'Export 2D curves to SVG format',
  inputs: {
    curves: {
      type: 'Wire[]',
      label: 'Curves',
      required: true,
    },
    filePath: {
      type: 'string',
      label: 'File Path',
      required: true,
    },
  },
  outputs: {
    success: {
      type: 'boolean',
      label: 'Success',
    },
    dimensions: {
      type: 'Vector',
      label: 'Dimensions',
    },
  },
  params: {
    scale: {
      type: 'number',
      label: 'Scale',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    strokeWidth: {
      type: 'number',
      label: 'Stroke Width',
      default: 1,
      min: 0.1,
      max: 10,
    },
    viewBox: {
      type: 'boolean',
      label: 'View Box',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
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
      success: results.success,
      dimensions: results.dimensions,
    };
  },
};
