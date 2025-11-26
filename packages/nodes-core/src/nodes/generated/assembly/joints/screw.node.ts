import type { NodeDefinition } from '@sim4d/types';

interface ScrewParams {
  pitch: number;
}

interface ScrewInputs {
  part1: unknown;
  part2: unknown;
  axis: unknown;
}

interface ScrewOutputs {
  joint: unknown;
}

export const AssemblyJointsScrewNode: NodeDefinition<ScrewInputs, ScrewOutputs, ScrewParams> = {
  id: 'Assembly::Screw',
  category: 'Assembly',
  label: 'Screw',
  description: 'Create screw joint',
  inputs: {
    part1: {
      type: 'Shape',
      label: 'Part1',
      required: true,
    },
    part2: {
      type: 'Shape',
      label: 'Part2',
      required: true,
    },
    axis: {
      type: 'Axis',
      label: 'Axis',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 1,
      min: 0.01,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointScrew',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        axis: inputs.axis,
        pitch: params.pitch,
      },
    });

    return {
      joint: result,
    };
  },
};
