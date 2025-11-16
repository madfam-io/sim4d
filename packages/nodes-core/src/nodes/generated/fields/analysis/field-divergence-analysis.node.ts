import type { NodeDefinition } from '@brepflow/types';

type FieldDivergenceAnalysisParams = Record<string, never>;

interface FieldDivergenceAnalysisInputs {
  vectorField?: unknown;
}

interface FieldDivergenceAnalysisOutputs {
  divergenceField: unknown;
}

export const FieldsAnalysisFieldDivergenceAnalysisNode: NodeDefinition<
  FieldDivergenceAnalysisInputs,
  FieldDivergenceAnalysisOutputs,
  FieldDivergenceAnalysisParams
> = {
  id: 'Fields::FieldDivergenceAnalysis',
  category: 'Fields',
  label: 'FieldDivergenceAnalysis',
  description: 'Calculate divergence of vector field',
  inputs: {
    vectorField: {
      type: 'VectorField',
      label: 'Vector Field',
      optional: true,
    },
  },
  outputs: {
    divergenceField: {
      type: 'Field',
      label: 'Divergence Field',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateDivergenceAnalysis',
      params: {
        vectorField: inputs.vectorField,
      },
    });

    return {
      divergenceField: result,
    };
  },
};
