import type { NodeDefinition } from '@brepflow/types';

interface SingularityAvoidanceParams {
  threshold: number;
}

interface SingularityAvoidanceInputs {
  jointTrajectory: unknown;
}

interface SingularityAvoidanceOutputs {
  safeTrajectory: unknown;
  singularityPoints: number[];
}

export const FabricationRoboticsSingularityAvoidanceNode: NodeDefinition<
  SingularityAvoidanceInputs,
  SingularityAvoidanceOutputs,
  SingularityAvoidanceParams
> = {
  id: 'Fabrication::SingularityAvoidance',
  type: 'Fabrication::SingularityAvoidance',
  category: 'Fabrication',
  label: 'SingularityAvoidance',
  description: 'Avoid robot singularities',
  inputs: {
    jointTrajectory: {
      type: 'Data',
      label: 'Joint Trajectory',
      required: true,
    },
  },
  outputs: {
    safeTrajectory: {
      type: 'Data',
      label: 'Safe Trajectory',
    },
    singularityPoints: {
      type: 'Number[]',
      label: 'Singularity Points',
    },
  },
  params: {
    threshold: {
      type: 'number',
      label: 'Threshold',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'singularityAvoidance',
      params: {
        jointTrajectory: inputs.jointTrajectory,
        threshold: params.threshold,
      },
    });

    return {
      safeTrajectory: results.safeTrajectory,
      singularityPoints: results.singularityPoints,
    };
  },
};
