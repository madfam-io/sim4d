import type { NodeDefinition } from '@brepflow/types';

interface GeneticAlgorithmParams {
  population: number;
  generations: number;
  mutationRate: number;
}

interface GeneticAlgorithmInputs {
  fitness: unknown;
  constraints?: unknown;
}

interface GeneticAlgorithmOutputs {
  best: unknown;
  population: unknown;
}

export const PatternsProceduralGeneticAlgorithmNode: NodeDefinition<
  GeneticAlgorithmInputs,
  GeneticAlgorithmOutputs,
  GeneticAlgorithmParams
> = {
  id: 'Patterns::GeneticAlgorithm',
  type: 'Patterns::GeneticAlgorithm',
  category: 'Patterns',
  label: 'GeneticAlgorithm',
  description: 'GA-based pattern optimization',
  inputs: {
    fitness: {
      type: 'Data',
      label: 'Fitness',
      required: true,
    },
    constraints: {
      type: 'Data',
      label: 'Constraints',
      optional: true,
    },
  },
  outputs: {
    best: {
      type: 'Shape',
      label: 'Best',
    },
    population: {
      type: 'Shape[]',
      label: 'Population',
    },
  },
  params: {
    population: {
      type: 'number',
      label: 'Population',
      default: 50,
      min: 10,
      max: 200,
      step: 5,
    },
    generations: {
      type: 'number',
      label: 'Generations',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    mutationRate: {
      type: 'number',
      label: 'Mutation Rate',
      default: 0.1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'geneticAlgorithm',
      params: {
        fitness: inputs.fitness,
        constraints: inputs.constraints,
        population: params.population,
        generations: params.generations,
        mutationRate: params.mutationRate,
      },
    });

    return {
      best: results.best,
      population: results.population,
    };
  },
};
