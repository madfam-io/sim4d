import type { NodeDefinition } from '@brepflow/types';

interface InverseKinematicsParams {
  solver: string;
  maxIterations: number;
  tolerance: number;
}

interface InverseKinematicsInputs {
  mechanism: unknown;
  targetPose: unknown;
}

interface InverseKinematicsOutputs {
  jointValues: unknown;
  reachable: unknown;
}

export const SimulationKinematicsInverseKinematicsNode: NodeDefinition<
  InverseKinematicsInputs,
  InverseKinematicsOutputs,
  InverseKinematicsParams
> = {
  id: 'Simulation::InverseKinematics',
  category: 'Simulation',
  label: 'InverseKinematics',
  description: 'Calculate inverse kinematics',
  inputs: {
    mechanism: {
      type: 'Data',
      label: 'Mechanism',
      required: true,
    },
    targetPose: {
      type: 'Data',
      label: 'Target Pose',
      required: true,
    },
  },
  outputs: {
    jointValues: {
      type: 'number[]',
      label: 'Joint Values',
    },
    reachable: {
      type: 'boolean',
      label: 'Reachable',
    },
  },
  params: {
    solver: {
      type: 'enum',
      label: 'Solver',
      default: 'jacobian',
      options: ['jacobian', 'ccd', 'fabrik'],
    },
    maxIterations: {
      type: 'number',
      label: 'Max Iterations',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0.0001,
      max: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'inverseKinematics',
      params: {
        mechanism: inputs.mechanism,
        targetPose: inputs.targetPose,
        solver: params.solver,
        maxIterations: params.maxIterations,
        tolerance: params.tolerance,
      },
    });

    return {
      jointValues: results.jointValues,
      reachable: results.reachable,
    };
  },
};
