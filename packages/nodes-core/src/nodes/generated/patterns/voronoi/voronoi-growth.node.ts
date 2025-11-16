import type { NodeDefinition } from '@brepflow/types';

interface VoronoiGrowthParams {
  generations: number;
  growthRate: number;
}

interface VoronoiGrowthInputs {
  seeds: Array<[number, number, number]>;
  boundary?: unknown;
}

interface VoronoiGrowthOutputs {
  pattern: unknown;
}

export const PatternsVoronoiVoronoiGrowthNode: NodeDefinition<
  VoronoiGrowthInputs,
  VoronoiGrowthOutputs,
  VoronoiGrowthParams
> = {
  id: 'Patterns::VoronoiGrowth',
  category: 'Patterns',
  label: 'VoronoiGrowth',
  description: 'Organic growth pattern',
  inputs: {
    seeds: {
      type: 'Point[]',
      label: 'Seeds',
      required: true,
    },
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      optional: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    generations: {
      type: 'number',
      label: 'Generations',
      default: 5,
      min: 1,
      max: 20,
      step: 1,
    },
    growthRate: {
      type: 'number',
      label: 'Growth Rate',
      default: 1.5,
      min: 1,
      max: 3,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiGrowth',
      params: {
        seeds: inputs.seeds,
        boundary: inputs.boundary,
        generations: params.generations,
        growthRate: params.growthRate,
      },
    });

    return {
      pattern: result,
    };
  },
};
