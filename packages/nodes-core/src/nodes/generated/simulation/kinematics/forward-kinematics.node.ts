import type { NodeDefinition } from '@brepflow/types';

interface ForwardKinematicsParams {
  timeStep: number;
  duration: number;
}

interface ForwardKinematicsInputs {
  mechanism: unknown;
  jointValues: unknown;
}

interface ForwardKinematicsOutputs {
  endEffectorPose: unknown;
  trajectory: unknown;
}

export const SimulationKinematicsForwardKinematicsNode: NodeDefinition<
  ForwardKinematicsInputs,
  ForwardKinematicsOutputs,
  ForwardKinematicsParams
> = {
  id: 'Simulation::ForwardKinematics',
  category: 'Simulation',
  label: 'ForwardKinematics',
  description: 'Calculate forward kinematics',
  inputs: {
    mechanism: {
      type: 'Data',
      label: 'Mechanism',
      required: true,
    },
    jointValues: {
      type: 'number[]',
      label: 'Joint Values',
      required: true,
    },
  },
  outputs: {
    endEffectorPose: {
      type: 'Data',
      label: 'End Effector Pose',
    },
    trajectory: {
      type: 'Wire',
      label: 'Trajectory',
    },
  },
  params: {
    timeStep: {
      type: 'number',
      label: 'Time Step',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    duration: {
      type: 'number',
      label: 'Duration',
      default: 1,
      min: 0.01,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'forwardKinematics',
      params: {
        mechanism: inputs.mechanism,
        jointValues: inputs.jointValues,
        timeStep: params.timeStep,
        duration: params.duration,
      },
    });

    return {
      endEffectorPose: results.endEffectorPose,
      trajectory: results.trajectory,
    };
  },
};
