import type { NodeDefinition } from '@sim4d/types';

interface JointLimitAvoidanceParams {
  margin: number;
}

interface JointLimitAvoidanceInputs {
  jointTrajectory: unknown;
}

interface JointLimitAvoidanceOutputs {
  safeTrajectory: unknown;
}

export const FabricationRoboticsJointLimitAvoidanceNode: NodeDefinition<
  JointLimitAvoidanceInputs,
  JointLimitAvoidanceOutputs,
  JointLimitAvoidanceParams
> = {
  id: 'Fabrication::JointLimitAvoidance',
  type: 'Fabrication::JointLimitAvoidance',
  category: 'Fabrication',
  label: 'JointLimitAvoidance',
  description: 'Avoid joint limits',
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
  },
  params: {
    margin: {
      type: 'number',
      label: 'Margin',
      default: 5,
      min: 0,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointLimitAvoidance',
      params: {
        jointTrajectory: inputs.jointTrajectory,
        margin: params.margin,
      },
    });

    return {
      safeTrajectory: result,
    };
  },
};
