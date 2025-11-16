import type { NodeDefinition } from '@brepflow/types';

type MedianParams = Record<string, never>;

interface MedianInputs {
  values: unknown;
}

interface MedianOutputs {
  median: unknown;
}

export const MathStatisticsMedianNode: NodeDefinition<MedianInputs, MedianOutputs, MedianParams> = {
  id: 'Math::Median',
  type: 'Math::Median',
  category: 'Math',
  label: 'Median',
  description: 'Calculate median',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    median: {
      type: 'number',
      label: 'Median',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathMedian',
      params: {
        values: inputs.values,
      },
    });

    return {
      median: result,
    };
  },
};
