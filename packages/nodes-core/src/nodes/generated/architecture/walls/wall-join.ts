import type { NodeDefinition } from '@sim4d/types';

interface WallJoinParams {
  joinType: string;
}

interface WallJoinInputs {
  wall1: unknown;
  wall2: unknown;
}

interface WallJoinOutputs {
  joinedWalls: unknown;
}

export const ArchitectureWallsWallJoinNode: NodeDefinition<
  WallJoinInputs,
  WallJoinOutputs,
  WallJoinParams
> = {
  id: 'Architecture::WallJoin',
  type: 'Architecture::WallJoin',
  category: 'Architecture',
  label: 'WallJoin',
  description: 'Join wall segments',
  inputs: {
    wall1: {
      type: 'Shape',
      label: 'Wall1',
      required: true,
    },
    wall2: {
      type: 'Shape',
      label: 'Wall2',
      required: true,
    },
  },
  outputs: {
    joinedWalls: {
      type: 'Shape',
      label: 'Joined Walls',
    },
  },
  params: {
    joinType: {
      type: 'enum',
      label: 'Join Type',
      default: 'miter',
      options: ['miter', 'butt', 'overlap'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'wallJoin',
      params: {
        wall1: inputs.wall1,
        wall2: inputs.wall2,
        joinType: params.joinType,
      },
    });

    return {
      joinedWalls: result,
    };
  },
};
