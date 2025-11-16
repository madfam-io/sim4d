import type { NodeDefinition } from '@brepflow/types';

interface PrismaticParams {
  minDistance: number;
  maxDistance: number;
}

interface PrismaticInputs {
  part1: unknown;
  part2: unknown;
  direction: [number, number, number];
}

interface PrismaticOutputs {
  joint: unknown;
}

export const AssemblyJointsPrismaticNode: NodeDefinition<
  PrismaticInputs,
  PrismaticOutputs,
  PrismaticParams
> = {
  id: 'Assembly::Prismatic',
  type: 'Assembly::Prismatic',
  category: 'Assembly',
  label: 'Prismatic',
  description: 'Create prismatic (sliding) joint',
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
    direction: {
      type: 'Vector',
      label: 'Direction',
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
      min: -10000,
      max: 10000,
    },
    maxDistance: {
      type: 'number',
      label: 'Max Distance',
      default: 100,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointPrismatic',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        direction: inputs.direction,
        minDistance: params.minDistance,
        maxDistance: params.maxDistance,
      },
    });

    return {
      joint: result,
    };
  },
};
