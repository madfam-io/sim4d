import type { NodeDefinition } from '@sim4d/types';

interface TrajectoryOptimizationParams {
  objective: string;
  maxVelocity: number;
  maxAcceleration: number;
}

interface TrajectoryOptimizationInputs {
  trajectory: unknown;
}

interface TrajectoryOptimizationOutputs {
  optimizedTrajectory: unknown;
  velocityProfile: unknown;
}

export const FabricationRoboticsTrajectoryOptimizationNode: NodeDefinition<
  TrajectoryOptimizationInputs,
  TrajectoryOptimizationOutputs,
  TrajectoryOptimizationParams
> = {
  id: 'Fabrication::TrajectoryOptimization',
  type: 'Fabrication::TrajectoryOptimization',
  category: 'Fabrication',
  label: 'TrajectoryOptimization',
  description: 'Optimize robot trajectory',
  inputs: {
    trajectory: {
      type: 'Transform[]',
      label: 'Trajectory',
      required: true,
    },
  },
  outputs: {
    optimizedTrajectory: {
      type: 'Transform[]',
      label: 'Optimized Trajectory',
    },
    velocityProfile: {
      type: 'Data',
      label: 'Velocity Profile',
    },
  },
  params: {
    objective: {
      type: 'enum',
      label: 'Objective',
      default: 'time',
      options: ['time', 'energy', 'smooth', 'accuracy'],
    },
    maxVelocity: {
      type: 'number',
      label: 'Max Velocity',
      default: 1000,
      min: 10,
      max: 5000,
    },
    maxAcceleration: {
      type: 'number',
      label: 'Max Acceleration',
      default: 5000,
      min: 100,
      max: 20000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'trajectoryOptimization',
      params: {
        trajectory: inputs.trajectory,
        objective: params.objective,
        maxVelocity: params.maxVelocity,
        maxAcceleration: params.maxAcceleration,
      },
    });

    return {
      optimizedTrajectory: results.optimizedTrajectory,
      velocityProfile: results.velocityProfile,
    };
  },
};
