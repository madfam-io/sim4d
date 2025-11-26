import type { NodeDefinition } from '@sim4d/types';

interface SphericalParams {
  coneAngle: number;
}

interface SphericalInputs {
  part1: unknown;
  part2: unknown;
  center: [number, number, number];
}

interface SphericalOutputs {
  joint: unknown;
}

export const AssemblyJointsSphericalNode: NodeDefinition<
  SphericalInputs,
  SphericalOutputs,
  SphericalParams
> = {
  id: 'Assembly::Spherical',
  category: 'Assembly',
  label: 'Spherical',
  description: 'Create spherical (ball) joint',
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
    center: {
      type: 'Point',
      label: 'Center',
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
    coneAngle: {
      type: 'number',
      label: 'Cone Angle',
      default: 45,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointSpherical',
      params: {
        part1: inputs.part1,
        part2: inputs.part2,
        center: inputs.center,
        coneAngle: params.coneAngle,
      },
    });

    return {
      joint: result,
    };
  },
};
