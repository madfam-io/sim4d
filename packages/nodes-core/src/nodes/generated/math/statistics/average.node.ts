import type { NodeDefinition } from '@brepflow/types';

type AverageParams = Record<string, never>;

interface AverageInputs {
  values: unknown;
}

interface AverageOutputs {
  average: unknown;
}

export const MathStatisticsAverageNode: NodeDefinition<
  AverageInputs,
  AverageOutputs,
  AverageParams
> = {
  id: 'Math::Average',
  category: 'Math',
  label: 'Average',
  description: 'Calculate average',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    average: {
      type: 'number',
      label: 'Average',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathAverage',
      params: {
        values: inputs.values,
      },
    });

    return {
      average: result,
    };
  },
};
