import type { NodeDefinition } from '@brepflow/types';

interface SVGImportParams {
  scale: number;
  tolerance: number;
  flatten: boolean;
}

interface SVGImportInputs {
  filePath: unknown;
}

interface SVGImportOutputs {
  curves: unknown;
  closed: unknown;
  open: unknown;
}

export const InteroperabilityImportSVGImportNode: NodeDefinition<
  SVGImportInputs,
  SVGImportOutputs,
  SVGImportParams
> = {
  id: 'Interoperability::SVGImport',
  category: 'Interoperability',
  label: 'SVGImport',
  description: 'Import SVG vector graphics',
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
    closed: {
      type: 'Wire[]',
      label: 'Closed',
    },
    open: {
      type: 'Wire[]',
      label: 'Open',
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
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    flatten: {
      type: 'boolean',
      label: 'Flatten',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'svgImport',
      params: {
        filePath: inputs.filePath,
        scale: params.scale,
        tolerance: params.tolerance,
        flatten: params.flatten,
      },
    });

    return {
      curves: results.curves,
      closed: results.closed,
      open: results.open,
    };
  },
};
