import type { NodeDefinition } from '@sim4d/types';

interface FieldAverageParams {
  sampleCount: number;
}

interface FieldAverageInputs {
  field?: unknown;
  domain?: unknown;
}

interface FieldAverageOutputs {
  average: number;
  standardDeviation: number;
}

export const FieldsAnalysisFieldAverageNode: NodeDefinition<
  FieldAverageInputs,
  FieldAverageOutputs,
  FieldAverageParams
> = {
  id: 'Fields::FieldAverage',
  type: 'Fields::FieldAverage',
  category: 'Fields',
  label: 'FieldAverage',
  description: 'Calculate average field value',
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
    average: {
      type: 'Number',
      label: 'Average',
    },
    standardDeviation: {
      type: 'Number',
      label: 'Standard Deviation',
    },
  },
  params: {
    sampleCount: {
      type: 'number',
      label: 'Sample Count',
      default: 1000,
      min: 100,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'calculateFieldAverage',
      params: {
        field: inputs.field,
        domain: inputs.domain,
        sampleCount: params.sampleCount,
      },
    });

    return {
      average: results.average,
      standardDeviation: results.standardDeviation,
    };
  },
};
