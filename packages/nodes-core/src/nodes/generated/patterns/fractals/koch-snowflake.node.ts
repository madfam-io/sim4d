import type { NodeDefinition } from '@sim4d/types';

interface KochSnowflakeParams {
  iterations: number;
}

interface KochSnowflakeInputs {
  triangle: unknown;
}

interface KochSnowflakeOutputs {
  fractal: unknown;
}

export const PatternsFractalsKochSnowflakeNode: NodeDefinition<
  KochSnowflakeInputs,
  KochSnowflakeOutputs,
  KochSnowflakeParams
> = {
  id: 'Patterns::KochSnowflake',
  category: 'Patterns',
  label: 'KochSnowflake',
  description: 'Koch snowflake fractal',
  inputs: {
    triangle: {
      type: 'Wire',
      label: 'Triangle',
      required: true,
    },
  },
  outputs: {
    fractal: {
      type: 'Wire',
      label: 'Fractal',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 4,
      min: 0,
      max: 8,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'kochSnowflake',
      params: {
        triangle: inputs.triangle,
        iterations: params.iterations,
      },
    });

    return {
      fractal: result,
    };
  },
};
