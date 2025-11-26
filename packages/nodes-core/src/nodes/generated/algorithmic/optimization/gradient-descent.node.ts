import type { NodeDefinition } from '@sim4d/types';

interface GradientDescentParams {
  learningRate: number;
  maxIterations: number;
  tolerance: number;
  momentum: number;
}

interface GradientDescentInputs {
  objective: unknown;
  initialPoint: [number, number, number];
}

interface GradientDescentOutputs {
  optimumPoint: [number, number, number];
  optimumValue: unknown;
  trajectory: Array<[number, number, number]>;
  convergence: unknown;
}

export const AlgorithmicOptimizationGradientDescentNode: NodeDefinition<
  GradientDescentInputs,
  GradientDescentOutputs,
  GradientDescentParams
> = {
  id: 'Algorithmic::GradientDescent',
  category: 'Algorithmic',
  label: 'GradientDescent',
  description: 'Gradient descent optimization',
  inputs: {
    objective: {
      type: 'Properties',
      label: 'Objective',
      required: true,
    },
    initialPoint: {
      type: 'Point',
      label: 'Initial Point',
      required: true,
    },
  },
  outputs: {
    optimumPoint: {
      type: 'Point',
      label: 'Optimum Point',
    },
    optimumValue: {
      type: 'number',
      label: 'Optimum Value',
    },
    trajectory: {
      type: 'Point[]',
      label: 'Trajectory',
    },
    convergence: {
      type: 'number[]',
      label: 'Convergence',
    },
  },
  params: {
    learningRate: {
      type: 'number',
      label: 'Learning Rate',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 1000,
      min: 10,
      max: 10000,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0.000001,
      max: 0.1,
    },
    momentum: {
      type: 'number',
      label: 'Momentum',
      default: 0.9,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'gradientDescent',
      params: {
        objective: inputs.objective,
        initialPoint: inputs.initialPoint,
        learningRate: params.learningRate,
        maxIterations: params.maxIterations,
        tolerance: params.tolerance,
        momentum: params.momentum,
      },
    });

    return {
      optimumPoint: results.optimumPoint,
      optimumValue: results.optimumValue,
      trajectory: results.trajectory,
      convergence: results.convergence,
    };
  },
};
