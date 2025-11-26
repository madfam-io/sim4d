import type { NodeDefinition } from '@sim4d/types';

interface FractalGeometryParams {
  type: string;
  iterations: number;
  scale: number;
}

interface FractalGeometryInputs {
  seed?: unknown;
}

interface FractalGeometryOutputs {
  fractal: unknown;
}

export const SpecializedOrganicFractalGeometryNode: NodeDefinition<
  FractalGeometryInputs,
  FractalGeometryOutputs,
  FractalGeometryParams
> = {
  id: 'Specialized::FractalGeometry',
  type: 'Specialized::FractalGeometry',
  category: 'Specialized',
  label: 'FractalGeometry',
  description: 'Generate fractal geometry',
  inputs: {
    seed: {
      type: 'Shape',
      label: 'Seed',
      optional: true,
    },
  },
  outputs: {
    fractal: {
      type: 'Shape',
      label: 'Fractal',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'koch',
      options: ['koch', 'sierpinski', 'menger', 'julia'],
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 3,
      min: 1,
      max: 7,
      step: 1,
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 100,
      min: 1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'fractalGeometry',
      params: {
        seed: inputs.seed,
        type: params.type,
        iterations: params.iterations,
        scale: params.scale,
      },
    });

    return {
      fractal: result,
    };
  },
};
