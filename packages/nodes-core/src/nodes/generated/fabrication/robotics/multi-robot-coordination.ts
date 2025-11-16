import type { NodeDefinition } from '@brepflow/types';

interface MultiRobotCoordinationParams {
  syncMethod: string;
}

interface MultiRobotCoordinationInputs {
  robotPaths: unknown;
}

interface MultiRobotCoordinationOutputs {
  synchronizedPaths: unknown;
}

export const FabricationRoboticsMultiRobotCoordinationNode: NodeDefinition<
  MultiRobotCoordinationInputs,
  MultiRobotCoordinationOutputs,
  MultiRobotCoordinationParams
> = {
  id: 'Fabrication::MultiRobotCoordination',
  type: 'Fabrication::MultiRobotCoordination',
  category: 'Fabrication',
  label: 'MultiRobotCoordination',
  description: 'Coordinate multiple robots',
  inputs: {
    robotPaths: {
      type: 'Transform[][]',
      label: 'Robot Paths',
      required: true,
    },
  },
  outputs: {
    synchronizedPaths: {
      type: 'Transform[][]',
      label: 'Synchronized Paths',
    },
  },
  params: {
    syncMethod: {
      type: 'enum',
      label: 'Sync Method',
      default: 'position',
      options: ['time', 'position', 'event'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'multiRobotCoordination',
      params: {
        robotPaths: inputs.robotPaths,
        syncMethod: params.syncMethod,
      },
    });

    return {
      synchronizedPaths: result,
    };
  },
};
