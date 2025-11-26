import type { NodeDefinition } from '@sim4d/types';

interface FlockingPatternParams {
  agents: number;
  steps: number;
  cohesion: number;
  separation: number;
  alignment: number;
}

interface FlockingPatternInputs {
  boundary: unknown;
}

interface FlockingPatternOutputs {
  trails: unknown;
}

export const PatternsAlgorithmicFlockingPatternNode: NodeDefinition<
  FlockingPatternInputs,
  FlockingPatternOutputs,
  FlockingPatternParams
> = {
  id: 'Patterns::FlockingPattern',
  category: 'Patterns',
  label: 'FlockingPattern',
  description: 'Flocking behavior simulation',
  inputs: {
    boundary: {
      type: 'Box',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    trails: {
      type: 'Wire[]',
      label: 'Trails',
    },
  },
  params: {
    agents: {
      type: 'number',
      label: 'Agents',
      default: 50,
      min: 10,
      max: 200,
      step: 5,
    },
    steps: {
      type: 'number',
      label: 'Steps',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    cohesion: {
      type: 'number',
      label: 'Cohesion',
      default: 1,
      min: 0,
      max: 2,
    },
    separation: {
      type: 'number',
      label: 'Separation',
      default: 1,
      min: 0,
      max: 2,
    },
    alignment: {
      type: 'number',
      label: 'Alignment',
      default: 1,
      min: 0,
      max: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'flockingPattern',
      params: {
        boundary: inputs.boundary,
        agents: params.agents,
        steps: params.steps,
        cohesion: params.cohesion,
        separation: params.separation,
        alignment: params.alignment,
      },
    });

    return {
      trails: result,
    };
  },
};
