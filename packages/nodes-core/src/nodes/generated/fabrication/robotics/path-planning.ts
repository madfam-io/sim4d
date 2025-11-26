import type { NodeDefinition } from '@sim4d/types';

interface PathPlanningParams {
  algorithm: string;
  smoothing: boolean;
}

interface PathPlanningInputs {
  waypoints: unknown;
  obstacles?: unknown;
}

interface PathPlanningOutputs {
  trajectory: unknown;
  jointTrajectory: unknown;
}

export const FabricationRoboticsPathPlanningNode: NodeDefinition<
  PathPlanningInputs,
  PathPlanningOutputs,
  PathPlanningParams
> = {
  id: 'Fabrication::PathPlanning',
  type: 'Fabrication::PathPlanning',
  category: 'Fabrication',
  label: 'PathPlanning',
  description: 'Robot path planning',
  inputs: {
    waypoints: {
      type: 'Transform[]',
      label: 'Waypoints',
      required: true,
    },
    obstacles: {
      type: 'Shape[]',
      label: 'Obstacles',
      optional: true,
    },
  },
  outputs: {
    trajectory: {
      type: 'Transform[]',
      label: 'Trajectory',
    },
    jointTrajectory: {
      type: 'Data',
      label: 'Joint Trajectory',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'rrt',
      options: ['rrt', 'prm', 'a-star', 'potential-field'],
    },
    smoothing: {
      type: 'boolean',
      label: 'Smoothing',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pathPlanning',
      params: {
        waypoints: inputs.waypoints,
        obstacles: inputs.obstacles,
        algorithm: params.algorithm,
        smoothing: params.smoothing,
      },
    });

    return {
      trajectory: results.trajectory,
      jointTrajectory: results.jointTrajectory,
    };
  },
};
