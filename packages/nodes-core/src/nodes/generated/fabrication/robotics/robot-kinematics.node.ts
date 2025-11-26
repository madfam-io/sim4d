import type { NodeDefinition } from '@sim4d/types';

interface RobotKinematicsParams {
  robotType: string;
  solver: string;
}

interface RobotKinematicsInputs {
  target: unknown;
  jointLimits?: unknown;
}

interface RobotKinematicsOutputs {
  jointAngles: number[];
  reachable: boolean;
}

export const FabricationRoboticsRobotKinematicsNode: NodeDefinition<
  RobotKinematicsInputs,
  RobotKinematicsOutputs,
  RobotKinematicsParams
> = {
  id: 'Fabrication::RobotKinematics',
  category: 'Fabrication',
  label: 'RobotKinematics',
  description: 'Robot kinematics solver',
  inputs: {
    target: {
      type: 'Transform',
      label: 'Target',
      required: true,
    },
    jointLimits: {
      type: 'Data',
      label: 'Joint Limits',
      optional: true,
    },
  },
  outputs: {
    jointAngles: {
      type: 'Number[]',
      label: 'Joint Angles',
    },
    reachable: {
      type: 'Boolean',
      label: 'Reachable',
    },
  },
  params: {
    robotType: {
      type: 'enum',
      label: 'Robot Type',
      default: '6-axis',
      options: ['6-axis', 'scara', 'delta', 'cartesian'],
    },
    solver: {
      type: 'enum',
      label: 'Solver',
      default: 'inverse',
      options: ['forward', 'inverse'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'robotKinematics',
      params: {
        target: inputs.target,
        jointLimits: inputs.jointLimits,
        robotType: params.robotType,
        solver: params.solver,
      },
    });

    return {
      jointAngles: results.jointAngles,
      reachable: results.reachable,
    };
  },
};
