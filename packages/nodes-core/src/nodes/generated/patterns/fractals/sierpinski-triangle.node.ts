import type { NodeDefinition } from '@sim4d/types';

interface SierpinskiTriangleParams {
  iterations: number;
  filled: boolean;
}

interface SierpinskiTriangleInputs {
  triangle: unknown;
}

interface SierpinskiTriangleOutputs {
  fractal: unknown;
}

export const PatternsFractalsSierpinskiTriangleNode: NodeDefinition<
  SierpinskiTriangleInputs,
  SierpinskiTriangleOutputs,
  SierpinskiTriangleParams
> = {
  id: 'Patterns::SierpinskiTriangle',
  category: 'Patterns',
  label: 'SierpinskiTriangle',
  description: 'Sierpinski triangle',
  inputs: {
    triangle: {
      type: 'Face',
      label: 'Triangle',
      required: true,
    },
  },
  outputs: {
    fractal: {
      type: 'Face[]',
      label: 'Fractal',
    },
  },
  params: {
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 5,
      min: 0,
      max: 10,
      step: 1,
    },
    filled: {
      type: 'boolean',
      label: 'Filled',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sierpinskiTriangle',
      params: {
        triangle: inputs.triangle,
        iterations: params.iterations,
        filled: params.filled,
      },
    });

    return {
      fractal: result,
    };
  },
};
