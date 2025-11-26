import type { NodeDefinition } from '@sim4d/types';

interface ParticleSwarmOptimizerParams {
  swarmSize: number;
  iterations: number;
  inertia: number;
  cognitive: number;
  social: number;
}

interface ParticleSwarmOptimizerInputs {
  objective: unknown;
  bounds: unknown;
}

interface ParticleSwarmOptimizerOutputs {
  globalBest: unknown;
  bestValue: unknown;
  swarmHistory: unknown;
}

export const AlgorithmicOptimizationParticleSwarmOptimizerNode: NodeDefinition<
  ParticleSwarmOptimizerInputs,
  ParticleSwarmOptimizerOutputs,
  ParticleSwarmOptimizerParams
> = {
  id: 'Algorithmic::ParticleSwarmOptimizer',
  type: 'Algorithmic::ParticleSwarmOptimizer',
  category: 'Algorithmic',
  label: 'ParticleSwarmOptimizer',
  description: 'Particle swarm optimization',
  inputs: {
    objective: {
      type: 'Properties',
      label: 'Objective',
      required: true,
    },
    bounds: {
      type: 'Properties',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    globalBest: {
      type: 'Properties',
      label: 'Global Best',
    },
    bestValue: {
      type: 'number',
      label: 'Best Value',
    },
    swarmHistory: {
      type: 'Properties[]',
      label: 'Swarm History',
    },
  },
  params: {
    swarmSize: {
      type: 'number',
      label: 'Swarm Size',
      default: 50,
      min: 10,
      max: 500,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 1000,
    },
    inertia: {
      type: 'number',
      label: 'Inertia',
      default: 0.7,
      min: 0.1,
      max: 1,
    },
    cognitive: {
      type: 'number',
      label: 'Cognitive',
      default: 2,
      min: 0.1,
      max: 4,
    },
    social: {
      type: 'number',
      label: 'Social',
      default: 2,
      min: 0.1,
      max: 4,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'particleSwarmOptimizer',
      params: {
        objective: inputs.objective,
        bounds: inputs.bounds,
        swarmSize: params.swarmSize,
        iterations: params.iterations,
        inertia: params.inertia,
        cognitive: params.cognitive,
        social: params.social,
      },
    });

    return {
      globalBest: results.globalBest,
      bestValue: results.bestValue,
      swarmHistory: results.swarmHistory,
    };
  },
};
