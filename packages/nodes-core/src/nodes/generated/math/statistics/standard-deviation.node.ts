import type { NodeDefinition } from '@brepflow/types';

interface StandardDeviationParams {
  sample: boolean;
}

interface StandardDeviationInputs {
  values: unknown;
}

interface StandardDeviationOutputs {
  stddev: unknown;
}

export const MathStatisticsStandardDeviationNode: NodeDefinition<
  StandardDeviationInputs,
  StandardDeviationOutputs,
  StandardDeviationParams
> = {
  id: 'Math::StandardDeviation',
  category: 'Math',
  label: 'StandardDeviation',
  description: 'Calculate standard deviation',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    stddev: {
      type: 'number',
      label: 'Stddev',
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
      type: 'mathStdDev',
      params: {
        values: inputs.values,
        sample: params.sample,
      },
    });

    return {
      stddev: result,
    };
  },
};
