import type { NodeDefinition } from '@sim4d/types';

interface VarianceParams {
  sample: boolean;
}

interface VarianceInputs {
  values: unknown;
}

interface VarianceOutputs {
  variance: unknown;
}

export const MathStatisticsVarianceNode: NodeDefinition<
  VarianceInputs,
  VarianceOutputs,
  VarianceParams
> = {
  id: 'Math::Variance',
  category: 'Math',
  label: 'Variance',
  description: 'Calculate variance',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    variance: {
      type: 'number',
      label: 'Variance',
    },
  },
  params: {
    sample: {
      type: 'boolean',
      label: 'Sample',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathVariance',
      params: {
        values: inputs.values,
        sample: params.sample,
      },
    });

    return {
      variance: result,
    };
  },
};
