import type { NodeDefinition } from '@brepflow/types';

interface CantorSetParams {
  iterations: number;
  ratio: number;
}

interface CantorSetInputs {
  segment: unknown;
}

interface CantorSetOutputs {
  segments: unknown;
}

export const PatternsFractalsCantorSetNode: NodeDefinition<
  CantorSetInputs,
  CantorSetOutputs,
  CantorSetParams
> = {
  id: 'Patterns::CantorSet',
  category: 'Patterns',
  label: 'CantorSet',
  description: 'Cantor set fractal',
  inputs: {
    segment: {
      type: 'Edge',
      label: 'Segment',
      required: true,
    },
  },
  outputs: {
    segments: {
      type: 'Edge[]',
      label: 'Segments',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    ratio: {
      type: 'number',
      label: 'Ratio',
      default: 0.333,
      min: 0.1,
      max: 0.5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'cantorSet',
      params: {
        segment: inputs.segment,
        iterations: params.iterations,
        ratio: params.ratio,
      },
    });

    return {
      segments: result,
    };
  },
};
