import type { NodeDefinition } from '@brepflow/types';

interface SimulatedAnnealingParams {
  initialTemp: number;
  finalTemp: number;
  coolingRate: number;
  maxIterations: number;
}

interface SimulatedAnnealingInputs {
  objective: unknown;
  initialSolution: unknown;
}

interface SimulatedAnnealingOutputs {
  bestSolution: unknown;
  bestValue: unknown;
  temperature: unknown;
  values: unknown;
}

export const AlgorithmicOptimizationSimulatedAnnealingNode: NodeDefinition<
  SimulatedAnnealingInputs,
  SimulatedAnnealingOutputs,
  SimulatedAnnealingParams
> = {
  id: 'Algorithmic::SimulatedAnnealing',
  category: 'Algorithmic',
  label: 'SimulatedAnnealing',
  description: 'Simulated annealing optimization',
  inputs: {
    objective: {
      type: 'Properties',
      label: 'Objective',
      required: true,
    },
    initialSolution: {
      type: 'Properties',
      label: 'Initial Solution',
      required: true,
    },
  },
  outputs: {
    bestSolution: {
      type: 'Properties',
      label: 'Best Solution',
    },
    bestValue: {
      type: 'number',
      label: 'Best Value',
    },
    temperature: {
      type: 'number[]',
      label: 'Temperature',
    },
    values: {
      type: 'number[]',
      label: 'Values',
    },
  },
  params: {
    initialTemp: {
      type: 'number',
      label: 'Initial Temp',
      default: 1000,
      min: 1,
      max: 10000,
    },
    finalTemp: {
      type: 'number',
      label: 'Final Temp',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
    coolingRate: {
      type: 'number',
      label: 'Cooling Rate',
      default: 0.95,
      min: 0.8,
      max: 0.99,
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 1000,
      min: 100,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'simulatedAnnealing',
      params: {
        objective: inputs.objective,
        initialSolution: inputs.initialSolution,
        initialTemp: params.initialTemp,
        finalTemp: params.finalTemp,
        coolingRate: params.coolingRate,
        maxIterations: params.maxIterations,
      },
    });

    return {
      bestSolution: results.bestSolution,
      bestValue: results.bestValue,
      temperature: results.temperature,
      values: results.values,
    };
  },
};
