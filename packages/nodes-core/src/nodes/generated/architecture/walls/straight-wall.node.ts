import type { NodeDefinition } from '@sim4d/types';

interface StraightWallParams {
  height: number;
  thickness: number;
  justification: string;
}

interface StraightWallInputs {
  centerline: unknown;
}

interface StraightWallOutputs {
  wall: unknown;
  centerline: unknown;
}

export const ArchitectureWallsStraightWallNode: NodeDefinition<
  StraightWallInputs,
  StraightWallOutputs,
  StraightWallParams
> = {
  id: 'Architecture::StraightWall',
  category: 'Architecture',
  label: 'StraightWall',
  description: 'Create straight wall segment',
  inputs: {
    centerline: {
      type: 'Wire',
      label: 'Centerline',
      required: true,
    },
  },
  outputs: {
    wall: {
      type: 'Shape',
      label: 'Wall',
    },
    centerline: {
      type: 'Wire',
      label: 'Centerline',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 3000,
      min: 100,
      max: 10000,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 200,
      min: 50,
      max: 500,
    },
    justification: {
      type: 'enum',
      label: 'Justification',
      default: 'center',
      options: ['center', 'left', 'right'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'straightWall',
      params: {
        centerline: inputs.centerline,
        height: params.height,
        thickness: params.thickness,
        justification: params.justification,
      },
    });

    return {
      wall: results.wall,
      centerline: results.centerline,
    };
  },
};
