import type { NodeDefinition } from '@sim4d/types';

type FieldCurlAnalysisParams = Record<string, never>;

interface FieldCurlAnalysisInputs {
  vectorField?: unknown;
}

interface FieldCurlAnalysisOutputs {
  curlField: unknown;
}

export const FieldsAnalysisFieldCurlAnalysisNode: NodeDefinition<
  FieldCurlAnalysisInputs,
  FieldCurlAnalysisOutputs,
  FieldCurlAnalysisParams
> = {
  id: 'Fields::FieldCurlAnalysis',
  type: 'Fields::FieldCurlAnalysis',
  category: 'Fields',
  label: 'FieldCurlAnalysis',
  description: 'Calculate curl of vector field',
  inputs: {
    vectorField: {
      type: 'VectorField',
      label: 'Vector Field',
      optional: true,
    },
  },
  outputs: {
    curlField: {
      type: 'VectorField',
      label: 'Curl Field',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateCurlAnalysis',
      params: {
        vectorField: inputs.vectorField,
      },
    });

    return {
      curlField: result,
    };
  },
};
