import type { NodeDefinition } from '@sim4d/types';

type CorrelationParams = Record<string, never>;

interface CorrelationInputs {
  x: unknown;
  y: unknown;
}

interface CorrelationOutputs {
  correlation: unknown;
}

export const MathStatisticsCorrelationNode: NodeDefinition<
  CorrelationInputs,
  CorrelationOutputs,
  CorrelationParams
> = {
  id: 'Math::Correlation',
  category: 'Math',
  label: 'Correlation',
  description: 'Correlation coefficient',
  inputs: {
    x: {
      type: 'number[]',
      label: 'X',
      required: true,
    },
    y: {
      type: 'number[]',
      label: 'Y',
      required: true,
    },
  },
  outputs: {
    correlation: {
      type: 'number',
      label: 'Correlation',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathCorrelation',
      params: {
        x: inputs.x,
        y: inputs.y,
      },
    });

    return {
      correlation: result,
    };
  },
};
