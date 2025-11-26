import type { NodeDefinition } from '@sim4d/types';

type PlanarParams = Record<string, never>;

interface PlanarInputs {
  part1: unknown;
  part2: unknown;
  plane: unknown;
}

interface PlanarOutputs {
  joint: unknown;
}

export const AssemblyJointsPlanarNode: NodeDefinition<PlanarInputs, PlanarOutputs, PlanarParams> = {
  id: 'Assembly::Planar',
  category: 'Assembly',
  label: 'Planar',
  description: 'Create planar joint',
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
    plane: {
      type: 'Plane',
      label: 'Plane',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointPlanar',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        plane: inputs.plane,
      },
    });

    return {
      joint: result,
    };
  },
};
