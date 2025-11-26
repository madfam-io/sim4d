import type { NodeDefinition } from '@sim4d/types';

interface ReachAnalysisParams {
  resolution: number;
}

interface ReachAnalysisInputs {
  robotModel: unknown;
  workspace: unknown;
}

interface ReachAnalysisOutputs {
  reachableVolume: unknown;
  coverage: number;
}

export const FabricationRoboticsReachAnalysisNode: NodeDefinition<
  ReachAnalysisInputs,
  ReachAnalysisOutputs,
  ReachAnalysisParams
> = {
  id: 'Fabrication::ReachAnalysis',
  category: 'Fabrication',
  label: 'ReachAnalysis',
  description: 'Analyze robot reach',
  inputs: {
    robotModel: {
      type: 'Data',
      label: 'Robot Model',
      required: true,
    },
    workspace: {
      type: 'Box',
      label: 'Workspace',
      required: true,
    },
  },
  outputs: {
    reachableVolume: {
      type: 'Shape',
      label: 'Reachable Volume',
    },
    coverage: {
      type: 'Number',
      label: 'Coverage',
    },
  },
  params: {
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 50,
      min: 10,
      max: 200,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'reachAnalysis',
      params: {
        robotModel: inputs.robotModel,
        workspace: inputs.workspace,
        resolution: params.resolution,
      },
    });

    return {
      reachableVolume: results.reachableVolume,
      coverage: results.coverage,
    };
  },
};
