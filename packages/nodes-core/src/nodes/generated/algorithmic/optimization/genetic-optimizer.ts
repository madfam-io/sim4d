import type { NodeDefinition } from '@brepflow/types';

interface GeneticOptimizerParams {
  populationSize: number;
  generations: number;
  mutationRate: number;
  crossoverRate: number;
  elitism: number;
}

interface GeneticOptimizerInputs {
  objectives: unknown;
  constraints?: unknown;
  bounds: unknown;
}

interface GeneticOptimizerOutputs {
  bestSolution: unknown;
  fitness: unknown;
  generations: unknown;
  convergence: unknown;
}

export const AlgorithmicOptimizationGeneticOptimizerNode: NodeDefinition<
  GeneticOptimizerInputs,
  GeneticOptimizerOutputs,
  GeneticOptimizerParams
> = {
  id: 'Algorithmic::GeneticOptimizer',
  type: 'Algorithmic::GeneticOptimizer',
  category: 'Algorithmic',
  label: 'GeneticOptimizer',
  description: 'Genetic algorithm optimization',
  inputs: {
    objectives: {
      type: 'Properties',
      label: 'Objectives',
      required: true,
    },
    constraints: {
      type: 'Properties',
      label: 'Constraints',
      optional: true,
    },
    bounds: {
      type: 'Properties',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    bestSolution: {
      type: 'Properties',
      label: 'Best Solution',
    },
    fitness: {
      type: 'number',
      label: 'Fitness',
    },
    generations: {
      type: 'Properties[]',
      label: 'Generations',
    },
    convergence: {
      type: 'number[]',
      label: 'Convergence',
    },
  },
  params: {
    populationSize: {
      type: 'number',
      label: 'Population Size',
      default: 100,
      min: 10,
      max: 1000,
    },
    generations: {
      type: 'number',
      label: 'Generations',
      default: 50,
      min: 5,
      max: 500,
    },
    mutationRate: {
      type: 'number',
      label: 'Mutation Rate',
      default: 0.1,
      min: 0.01,
      max: 0.5,
    },
    crossoverRate: {
      type: 'number',
      label: 'Crossover Rate',
      default: 0.8,
      min: 0.1,
      max: 1,
    },
    elitism: {
      type: 'number',
      label: 'Elitism',
      default: 0.1,
      min: 0,
      max: 0.5,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'geneticOptimizer',
      params: {
        objectives: inputs.objectives,
        constraints: inputs.constraints,
        bounds: inputs.bounds,
        populationSize: params.populationSize,
        generations: params.generations,
        mutationRate: params.mutationRate,
        crossoverRate: params.crossoverRate,
        elitism: params.elitism,
      },
    });

    return {
      bestSolution: results.bestSolution,
      fitness: results.fitness,
      generations: results.generations,
      convergence: results.convergence,
    };
  },
};
