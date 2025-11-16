import type { NodeDefinition } from '@brepflow/types';

interface DiffusionLimitedAggregationParams {
  particles: number;
  stickiness: number;
}

interface DiffusionLimitedAggregationInputs {
  seed: [number, number, number];
}

interface DiffusionLimitedAggregationOutputs {
  aggregate: Array<[number, number, number]>;
}

export const PatternsAlgorithmicDiffusionLimitedAggregationNode: NodeDefinition<
  DiffusionLimitedAggregationInputs,
  DiffusionLimitedAggregationOutputs,
  DiffusionLimitedAggregationParams
> = {
  id: 'Patterns::DiffusionLimitedAggregation',
  type: 'Patterns::DiffusionLimitedAggregation',
  category: 'Patterns',
  label: 'DiffusionLimitedAggregation',
  description: 'DLA growth pattern',
  inputs: {
    seed: {
      type: 'Point',
      label: 'Seed',
      required: true,
    },
  },
  outputs: {
    aggregate: {
      type: 'Point[]',
      label: 'Aggregate',
    },
  },
  params: {
    particles: {
      type: 'number',
      label: 'Particles',
      default: 1000,
      min: 100,
      max: 10000,
      step: 100,
    },
    stickiness: {
      type: 'number',
      label: 'Stickiness',
      default: 1,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'dlaPattern',
      params: {
        seed: inputs.seed,
        particles: params.particles,
        stickiness: params.stickiness,
      },
    });

    return {
      aggregate: result,
    };
  },
};
