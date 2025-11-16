import type { NodeDefinition } from '@brepflow/types';

interface ShapeOptimizeParams {
  objective: string;
  morphRadius: number;
  iterations: number;
}

interface ShapeOptimizeInputs {
  initialShape: unknown;
  boundaryConditions: unknown;
}

interface ShapeOptimizeOutputs {
  optimized: unknown;
}

export const SpecializedOptimizationShapeOptimizeNode: NodeDefinition<
  ShapeOptimizeInputs,
  ShapeOptimizeOutputs,
  ShapeOptimizeParams
> = {
  id: 'Specialized::ShapeOptimize',
  category: 'Specialized',
  label: 'ShapeOptimize',
  description: 'Shape optimization',
  inputs: {
    initialShape: {
      type: 'Shape',
      label: 'Initial Shape',
      required: true,
    },
    boundaryConditions: {
      type: 'Data',
      label: 'Boundary Conditions',
      required: true,
    },
  },
  outputs: {
    optimized: {
      type: 'Shape',
      label: 'Optimized',
    },
  },
  params: {
    objective: {
      type: 'enum',
      label: 'Objective',
      default: 'min-weight',
      options: ['min-weight', 'max-stiffness', 'min-stress'],
    },
    morphRadius: {
      type: 'number',
      label: 'Morph Radius',
      default: 5,
      min: 0.5,
      max: 50,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 50,
      min: 5,
      max: 200,
      step: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'shapeOptimize',
      params: {
        initialShape: inputs.initialShape,
        boundaryConditions: inputs.boundaryConditions,
        objective: params.objective,
        morphRadius: params.morphRadius,
        iterations: params.iterations,
      },
    });

    return {
      optimized: result,
    };
  },
};
