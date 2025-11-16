import type { NodeDefinition } from '@brepflow/types';

interface FieldOptimizeParams {
  iterations: number;
  objective: string;
  learningRate: number;
}

interface FieldOptimizeInputs {
  initialField?: unknown;
  constraints?: unknown;
}

interface FieldOptimizeOutputs {
  optimizedField: unknown;
  convergence: unknown;
}

export const FieldsAdvancedFieldOptimizeNode: NodeDefinition<
  FieldOptimizeInputs,
  FieldOptimizeOutputs,
  FieldOptimizeParams
> = {
  id: 'Fields::FieldOptimize',
  category: 'Fields',
  label: 'FieldOptimize',
  description: 'Optimize field for objective',
  inputs: {
    initialField: {
      type: 'Field',
      label: 'Initial Field',
      optional: true,
    },
    constraints: {
      type: 'Field',
      label: 'Constraints',
      optional: true,
    },
  },
  outputs: {
    optimizedField: {
      type: 'Field',
      label: 'Optimized Field',
    },
    convergence: {
      type: 'NumberList',
      label: 'Convergence',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 1000,
    },
    objective: {
      type: 'enum',
      label: 'Objective',
      default: '"minimize"',
      options: ['minimize', 'maximize', 'smooth', 'sharpen'],
    },
    learningRate: {
      type: 'number',
      label: 'Learning Rate',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'optimizeField',
      params: {
        initialField: inputs.initialField,
        constraints: inputs.constraints,
        iterations: params.iterations,
        objective: params.objective,
        learningRate: params.learningRate,
      },
    });

    return {
      optimizedField: results.optimizedField,
      convergence: results.convergence,
    };
  },
};
