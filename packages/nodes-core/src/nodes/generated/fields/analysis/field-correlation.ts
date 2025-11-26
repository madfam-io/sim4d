import type { NodeDefinition } from '@sim4d/types';

interface FieldCorrelationParams {
  sampleCount: number;
}

interface FieldCorrelationInputs {
  field1?: unknown;
  field2?: unknown;
  domain?: unknown;
}

interface FieldCorrelationOutputs {
  correlation: number;
  covariance: number;
}

export const FieldsAnalysisFieldCorrelationNode: NodeDefinition<
  FieldCorrelationInputs,
  FieldCorrelationOutputs,
  FieldCorrelationParams
> = {
  id: 'Fields::FieldCorrelation',
  type: 'Fields::FieldCorrelation',
  category: 'Fields',
  label: 'FieldCorrelation',
  description: 'Calculate correlation between fields',
  inputs: {
    field1: {
      type: 'Field',
      label: 'Field1',
      optional: true,
    },
    field2: {
      type: 'Field',
      label: 'Field2',
      optional: true,
    },
    domain: {
      type: 'Geometry',
      label: 'Domain',
      optional: true,
    },
  },
  outputs: {
    correlation: {
      type: 'Number',
      label: 'Correlation',
    },
    covariance: {
      type: 'Number',
      label: 'Covariance',
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
      type: 'calculateCorrelation',
      params: {
        field1: inputs.field1,
        field2: inputs.field2,
        domain: inputs.domain,
        sampleCount: params.sampleCount,
      },
    });

    return {
      correlation: results.correlation,
      covariance: results.covariance,
    };
  },
};
