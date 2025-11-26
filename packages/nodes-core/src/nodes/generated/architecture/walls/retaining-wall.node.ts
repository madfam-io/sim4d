import type { NodeDefinition } from '@sim4d/types';

interface RetainingWallParams {
  height: number;
  baseThickness: number;
  batter: number;
}

interface RetainingWallInputs {
  path: unknown;
}

interface RetainingWallOutputs {
  retainingWall: unknown;
}

export const ArchitectureWallsRetainingWallNode: NodeDefinition<
  RetainingWallInputs,
  RetainingWallOutputs,
  RetainingWallParams
> = {
  id: 'Architecture::RetainingWall',
  category: 'Architecture',
  label: 'RetainingWall',
  description: 'Retaining wall with batter',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    retainingWall: {
      type: 'Shape',
      label: 'Retaining Wall',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 2000,
      min: 500,
      max: 6000,
    },
    baseThickness: {
      type: 'number',
      label: 'Base Thickness',
      default: 400,
      min: 200,
      max: 1000,
    },
    batter: {
      type: 'number',
      label: 'Batter',
      default: 10,
      min: 0,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'retainingWall',
      params: {
        path: inputs.path,
        height: params.height,
        baseThickness: params.baseThickness,
        batter: params.batter,
      },
    });

    return {
      retainingWall: result,
    };
  },
};
