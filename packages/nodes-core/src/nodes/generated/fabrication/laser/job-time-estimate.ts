import type { NodeDefinition } from '@sim4d/types';

interface JobTimeEstimateParams {
  rapidSpeed: number;
}

interface JobTimeEstimateInputs {
  cuttingPaths: unknown;
  engravingPaths?: unknown;
}

interface JobTimeEstimateOutputs {
  totalTime: number;
  cuttingTime: number;
  engravingTime: number;
}

export const FabricationLaserJobTimeEstimateNode: NodeDefinition<
  JobTimeEstimateInputs,
  JobTimeEstimateOutputs,
  JobTimeEstimateParams
> = {
  id: 'Fabrication::JobTimeEstimate',
  type: 'Fabrication::JobTimeEstimate',
  category: 'Fabrication',
  label: 'JobTimeEstimate',
  description: 'Estimate job time',
  inputs: {
    cuttingPaths: {
      type: 'Wire[]',
      label: 'Cutting Paths',
      required: true,
    },
    engravingPaths: {
      type: 'Wire[]',
      label: 'Engraving Paths',
      optional: true,
    },
  },
  outputs: {
    totalTime: {
      type: 'Number',
      label: 'Total Time',
    },
    cuttingTime: {
      type: 'Number',
      label: 'Cutting Time',
    },
    engravingTime: {
      type: 'Number',
      label: 'Engraving Time',
    },
  },
  params: {
    rapidSpeed: {
      type: 'number',
      label: 'Rapid Speed',
      default: 500,
      min: 100,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'jobTimeEstimate',
      params: {
        cuttingPaths: inputs.cuttingPaths,
        engravingPaths: inputs.engravingPaths,
        rapidSpeed: params.rapidSpeed,
      },
    });

    return {
      totalTime: results.totalTime,
      cuttingTime: results.cuttingTime,
      engravingTime: results.engravingTime,
    };
  },
};
