import type { NodeDefinition } from '@sim4d/types';

interface RoboticMillingParams {
  spindleSpeed: number;
  feedRate: number;
}

interface RoboticMillingInputs {
  millingPaths: unknown;
  toolOrientation?: [number, number, number];
}

interface RoboticMillingOutputs {
  robotProgram: unknown;
}

export const FabricationRoboticsRoboticMillingNode: NodeDefinition<
  RoboticMillingInputs,
  RoboticMillingOutputs,
  RoboticMillingParams
> = {
  id: 'Fabrication::RoboticMilling',
  category: 'Fabrication',
  label: 'RoboticMilling',
  description: 'Robotic milling paths',
  inputs: {
    millingPaths: {
      type: 'Wire[]',
      label: 'Milling Paths',
      required: true,
    },
    toolOrientation: {
      type: 'Vector',
      label: 'Tool Orientation',
      optional: true,
    },
  },
  outputs: {
    robotProgram: {
      type: 'Data',
      label: 'Robot Program',
    },
  },
  params: {
    spindleSpeed: {
      type: 'number',
      label: 'Spindle Speed',
      default: 10000,
      min: 1000,
      max: 30000,
    },
    feedRate: {
      type: 'number',
      label: 'Feed Rate',
      default: 1000,
      min: 10,
      max: 5000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'roboticMilling',
      params: {
        millingPaths: inputs.millingPaths,
        toolOrientation: inputs.toolOrientation,
        spindleSpeed: params.spindleSpeed,
        feedRate: params.feedRate,
      },
    });

    return {
      robotProgram: result,
    };
  },
};
