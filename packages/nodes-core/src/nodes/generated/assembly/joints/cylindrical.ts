import type { NodeDefinition } from '@sim4d/types';

interface CylindricalParams {
  minDistance: number;
  maxDistance: number;
  minAngle: number;
  maxAngle: number;
}

interface CylindricalInputs {
  part1: unknown;
  part2: unknown;
  axis: unknown;
}

interface CylindricalOutputs {
  joint: unknown;
}

export const AssemblyJointsCylindricalNode: NodeDefinition<
  CylindricalInputs,
  CylindricalOutputs,
  CylindricalParams
> = {
  id: 'Assembly::Cylindrical',
  type: 'Assembly::Cylindrical',
  category: 'Assembly',
  label: 'Cylindrical',
  description: 'Create cylindrical joint',
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
    minDistance: {
      type: 'number',
      label: 'Min Distance',
      default: 0,
    },
    maxDistance: {
      type: 'number',
      label: 'Max Distance',
      default: 100,
    },
    minAngle: {
      type: 'number',
      label: 'Min Angle',
      default: -180,
    },
    maxAngle: {
      type: 'number',
      label: 'Max Angle',
      default: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointCylindrical',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        axis: inputs.axis,
        minDistance: params.minDistance,
        maxDistance: params.maxDistance,
        minAngle: params.minAngle,
        maxAngle: params.maxAngle,
      },
    });

    return {
      joint: result,
    };
  },
};
