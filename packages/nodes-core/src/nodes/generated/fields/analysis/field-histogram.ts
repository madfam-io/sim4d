import type { NodeDefinition } from '@brepflow/types';

interface FieldHistogramParams {
  bins: number;
}

interface FieldHistogramInputs {
  field?: unknown;
  domain?: unknown;
}

interface FieldHistogramOutputs {
  binCenters: unknown;
  binCounts: unknown;
  binEdges: unknown;
}

export const FieldsAnalysisFieldHistogramNode: NodeDefinition<
  FieldHistogramInputs,
  FieldHistogramOutputs,
  FieldHistogramParams
> = {
  id: 'Fields::FieldHistogram',
  type: 'Fields::FieldHistogram',
  category: 'Fields',
  label: 'FieldHistogram',
  description: 'Generate histogram of field values',
  inputs: {
    field: {
      type: 'Field',
      label: 'Field',
      optional: true,
    },
    domain: {
      type: 'Geometry',
      label: 'Domain',
      optional: true,
    },
  },
  outputs: {
    binCenters: {
      type: 'NumberList',
      label: 'Bin Centers',
    },
    binCounts: {
      type: 'NumberList',
      label: 'Bin Counts',
    },
    binEdges: {
      type: 'NumberList',
      label: 'Bin Edges',
    },
  },
  params: {
    bins: {
      type: 'number',
      label: 'Bins',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'generateHistogram',
      params: {
        field: inputs.field,
        domain: inputs.domain,
        bins: params.bins,
      },
    });

    return {
      binCenters: results.binCenters,
      binCounts: results.binCounts,
      binEdges: results.binEdges,
    };
  },
};
