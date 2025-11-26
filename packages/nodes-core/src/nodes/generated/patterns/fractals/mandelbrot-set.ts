import type { NodeDefinition } from '@sim4d/types';

interface MandelbrotSetParams {
  iterations: number;
  resolution: number;
  zoom: number;
}

interface MandelbrotSetInputs {
  center: [number, number, number];
}

interface MandelbrotSetOutputs {
  fractal: unknown;
}

export const PatternsFractalsMandelbrotSetNode: NodeDefinition<
  MandelbrotSetInputs,
  MandelbrotSetOutputs,
  MandelbrotSetParams
> = {
  id: 'Patterns::MandelbrotSet',
  type: 'Patterns::MandelbrotSet',
  category: 'Patterns',
  label: 'MandelbrotSet',
  description: 'Mandelbrot set',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
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
      default: 200,
      min: 50,
      max: 1000,
      step: 10,
    },
    zoom: {
      type: 'number',
      label: 'Zoom',
      default: 1,
      min: 0.1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mandelbrotSet',
      params: {
        center: inputs.center,
        iterations: params.iterations,
        resolution: params.resolution,
        zoom: params.zoom,
      },
    });

    return {
      fractal: result,
    };
  },
};
