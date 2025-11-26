import type { NodeDefinition } from '@sim4d/types';

interface RetractionOptimizationParams {
  retractionDistance: number;
  minTravelDistance: number;
}

interface RetractionOptimizationInputs {
  toolpath: unknown;
}

interface RetractionOptimizationOutputs {
  retractionPoints: Array<[number, number, number]>;
}

export const Fabrication3DPrintingRetractionOptimizationNode: NodeDefinition<
  RetractionOptimizationInputs,
  RetractionOptimizationOutputs,
  RetractionOptimizationParams
> = {
  id: 'Fabrication::RetractionOptimization',
  type: 'Fabrication::RetractionOptimization',
  category: 'Fabrication',
  label: 'RetractionOptimization',
  description: 'Optimize retraction points',
  inputs: {
    toolpath: {
      type: 'Wire[]',
      label: 'Toolpath',
      required: true,
    },
  },
  outputs: {
    retractionPoints: {
      type: 'Point[]',
      label: 'Retraction Points',
    },
  },
  params: {
    retractionDistance: {
      type: 'number',
      label: 'Retraction Distance',
      default: 1,
      min: 0,
      max: 10,
    },
    minTravelDistance: {
      type: 'number',
      label: 'Min Travel Distance',
      default: 2,
      min: 0.5,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'retractionOptimization',
      params: {
        toolpath: inputs.toolpath,
        retractionDistance: params.retractionDistance,
        minTravelDistance: params.minTravelDistance,
      },
    });

    return {
      retractionPoints: result,
    };
  },
};
