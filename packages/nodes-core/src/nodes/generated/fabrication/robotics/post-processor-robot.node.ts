import type { NodeDefinition } from '@brepflow/types';

interface PostProcessorRobotParams {
  robotBrand: string;
}

interface PostProcessorRobotInputs {
  trajectory: unknown;
}

interface PostProcessorRobotOutputs {
  robotCode: unknown;
}

export const FabricationRoboticsPostProcessorRobotNode: NodeDefinition<
  PostProcessorRobotInputs,
  PostProcessorRobotOutputs,
  PostProcessorRobotParams
> = {
  id: 'Fabrication::PostProcessorRobot',
  category: 'Fabrication',
  label: 'PostProcessorRobot',
  description: 'Robot code generation',
  inputs: {
    trajectory: {
      type: 'Transform[]',
      label: 'Trajectory',
      required: true,
    },
  },
  outputs: {
    robotCode: {
      type: 'Data',
      label: 'Robot Code',
    },
  },
  params: {
    robotBrand: {
      type: 'enum',
      label: 'Robot Brand',
      default: 'abb',
      options: ['abb', 'kuka', 'fanuc', 'yaskawa', 'ur'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'postProcessorRobot',
      params: {
        trajectory: inputs.trajectory,
        robotBrand: params.robotBrand,
      },
    });

    return {
      robotCode: result,
    };
  },
};
