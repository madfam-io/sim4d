import type { NodeDefinition } from '@sim4d/types';

interface InfillOptimizationParams {
  minDensity: number;
  maxDensity: number;
  gradientDistance: number;
}

interface InfillOptimizationInputs {
  model: unknown;
  stressMap?: unknown;
}

interface InfillOptimizationOutputs {
  adaptiveInfill: unknown;
}

export const Fabrication3DPrintingInfillOptimizationNode: NodeDefinition<
  InfillOptimizationInputs,
  InfillOptimizationOutputs,
  InfillOptimizationParams
> = {
  id: 'Fabrication::InfillOptimization',
  category: 'Fabrication',
  label: 'InfillOptimization',
  description: 'Adaptive infill generation',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
    stressMap: {
      type: 'Data',
      label: 'Stress Map',
      optional: true,
    },
  },
  outputs: {
    adaptiveInfill: {
      type: 'Wire[]',
      label: 'Adaptive Infill',
    },
  },
  params: {
    minDensity: {
      type: 'number',
      label: 'Min Density',
      default: 0.1,
      min: 0,
      max: 1,
    },
    maxDensity: {
      type: 'number',
      label: 'Max Density',
      default: 0.5,
      min: 0,
      max: 1,
    },
    gradientDistance: {
      type: 'number',
      label: 'Gradient Distance',
      default: 5,
      min: 1,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'infillOptimization',
      params: {
        model: inputs.model,
        stressMap: inputs.stressMap,
        minDensity: params.minDensity,
        maxDensity: params.maxDensity,
        gradientDistance: params.gradientDistance,
      },
    });

    return {
      adaptiveInfill: result,
    };
  },
};
