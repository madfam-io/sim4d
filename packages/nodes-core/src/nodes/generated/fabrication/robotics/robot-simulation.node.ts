import type { NodeDefinition } from '@brepflow/types';

interface RobotSimulationParams {
  timeStep: number;
  dynamics: boolean;
}

interface RobotSimulationInputs {
  program: unknown;
}

interface RobotSimulationOutputs {
  simulation: unknown;
  cycleTime: number;
}

export const FabricationRoboticsRobotSimulationNode: NodeDefinition<
  RobotSimulationInputs,
  RobotSimulationOutputs,
  RobotSimulationParams
> = {
  id: 'Fabrication::RobotSimulation',
  category: 'Fabrication',
  label: 'RobotSimulation',
  description: 'Simulate robot motion',
  inputs: {
    program: {
      type: 'Data',
      label: 'Program',
      required: true,
    },
  },
  outputs: {
    simulation: {
      type: 'Data',
      label: 'Simulation',
    },
    cycleTime: {
      type: 'Number',
      label: 'Cycle Time',
    },
  },
  params: {
    timeStep: {
      type: 'number',
      label: 'Time Step',
      default: 0.01,
      min: 0.001,
      max: 0.1,
    },
    dynamics: {
      type: 'boolean',
      label: 'Dynamics',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'robotSimulation',
      params: {
        program: inputs.program,
        timeStep: params.timeStep,
        dynamics: params.dynamics,
      },
    });

    return {
      simulation: results.simulation,
      cycleTime: results.cycleTime,
    };
  },
};
