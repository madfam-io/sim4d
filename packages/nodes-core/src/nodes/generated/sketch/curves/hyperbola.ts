import type { NodeDefinition } from '@brepflow/types';

interface HyperbolaParams {
  majorRadius: number;
  minorRadius: number;
  startParam: number;
  endParam: number;
}

interface HyperbolaInputs {
  center?: [number, number, number];
}

interface HyperbolaOutputs {
  curve: unknown;
}

export const SketchCurvesHyperbolaNode: NodeDefinition<
  HyperbolaInputs,
  HyperbolaOutputs,
  HyperbolaParams
> = {
  id: 'Sketch::Hyperbola',
  type: 'Sketch::Hyperbola',
  category: 'Sketch',
  label: 'Hyperbola',
  description: 'Create a hyperbolic curve',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {
    majorRadius: {
      type: 'number',
      label: 'Major Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    minorRadius: {
      type: 'number',
      label: 'Minor Radius',
      default: 30,
      min: 0.1,
      max: 10000,
    },
    startParam: {
      type: 'number',
      label: 'Start Param',
      default: -2,
      min: -10,
      max: 10,
    },
    endParam: {
      type: 'number',
      label: 'End Param',
      default: 2,
      min: -10,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeHyperbola',
      params: {
        center: inputs.center,
        majorRadius: params.majorRadius,
        minorRadius: params.minorRadius,
        startParam: params.startParam,
        endParam: params.endParam,
      },
    });

    return {
      curve: result,
    };
  },
};
