import type { NodeDefinition } from '@brepflow/types';

type FieldMinMaxParams = Record<string, never>;

interface FieldMinMaxInputs {
  field?: unknown;
  domain?: unknown;
}

interface FieldMinMaxOutputs {
  min: number;
  max: number;
  minPoint: [number, number, number];
  maxPoint: [number, number, number];
}

export const FieldsAnalysisFieldMinMaxNode: NodeDefinition<
  FieldMinMaxInputs,
  FieldMinMaxOutputs,
  FieldMinMaxParams
> = {
  id: 'Fields::FieldMinMax',
  category: 'Fields',
  label: 'FieldMinMax',
  description: 'Find minimum and maximum field values',
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
    min: {
      type: 'Number',
      label: 'Min',
    },
    max: {
      type: 'Number',
      label: 'Max',
    },
    minPoint: {
      type: 'Point',
      label: 'Min Point',
    },
    maxPoint: {
      type: 'Point',
      label: 'Max Point',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'analyzeFieldMinMax',
      params: {
        field: inputs.field,
        domain: inputs.domain,
      },
    });

    return {
      min: results.min,
      max: results.max,
      minPoint: results.minPoint,
      maxPoint: results.maxPoint,
    };
  },
};
