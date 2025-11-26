import type { NodeDefinition } from '@sim4d/types';

interface WallOpeningParams {
  width: number;
  height: number;
  sillHeight: number;
}

interface WallOpeningInputs {
  wall: unknown;
  position: [number, number, number];
}

interface WallOpeningOutputs {
  wallWithOpening: unknown;
  opening: unknown;
}

export const ArchitectureWallsWallOpeningNode: NodeDefinition<
  WallOpeningInputs,
  WallOpeningOutputs,
  WallOpeningParams
> = {
  id: 'Architecture::WallOpening',
  category: 'Architecture',
  label: 'WallOpening',
  description: 'Create opening in wall',
  inputs: {
    wall: {
      type: 'Shape',
      label: 'Wall',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    wallWithOpening: {
      type: 'Shape',
      label: 'Wall With Opening',
    },
    opening: {
      type: 'Face',
      label: 'Opening',
    },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 900,
      min: 100,
      max: 5000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 2100,
      min: 100,
      max: 5000,
    },
    sillHeight: {
      type: 'number',
      label: 'Sill Height',
      default: 0,
      min: 0,
      max: 2000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'wallOpening',
      params: {
        wall: inputs.wall,
        position: inputs.position,
        width: params.width,
        height: params.height,
        sillHeight: params.sillHeight,
      },
    });

    return {
      wallWithOpening: results.wallWithOpening,
      opening: results.opening,
    };
  },
};
