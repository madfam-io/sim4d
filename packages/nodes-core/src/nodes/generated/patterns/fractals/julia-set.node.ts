import type { NodeDefinition } from '@brepflow/types';

interface JuliaSetParams {
  cReal: number;
  cImag: number;
  iterations: number;
  resolution: number;
}

interface JuliaSetInputs {
  bounds: unknown;
}

interface JuliaSetOutputs {
  fractal: unknown;
}

export const PatternsFractalsJuliaSetNode: NodeDefinition<
  JuliaSetInputs,
  JuliaSetOutputs,
  JuliaSetParams
> = {
  id: 'Patterns::JuliaSet',
  category: 'Patterns',
  label: 'JuliaSet',
  description: 'Julia set fractal',
  inputs: {
    bounds: {
      type: 'Box',
      label: 'Bounds',
      required: true,
    },
  },
  outputs: {
    fractal: {
      type: 'Mesh',
      label: 'Fractal',
    },
  },
  params: {
    cReal: {
      type: 'number',
      label: 'C Real',
      default: -0.7,
      min: -2,
      max: 2,
    },
    cImag: {
      type: 'number',
      label: 'C Imag',
      default: 0.27,
      min: -2,
      max: 2,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 100,
      min: 50,
      max: 500,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'juliaSet',
      params: {
        bounds: inputs.bounds,
        cReal: params.cReal,
        cImag: params.cImag,
        iterations: params.iterations,
        resolution: params.resolution,
      },
    });

    return {
      fractal: result,
    };
  },
};
