import type { NodeDefinition } from '@sim4d/types';

interface BoxParams {
  width: number;
  depth: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}

type BoxInputs = Record<string, never>;

interface BoxOutputs {
  solid: unknown;
}

export const SolidPrimitivesBoxNode: NodeDefinition<BoxInputs, BoxOutputs, BoxParams> = {
  id: 'Solid::Box',
  category: 'Solid',
  label: 'Box',
  description: 'Create a parametric box/cuboid',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    depth: {
      type: 'number',
      label: 'Depth',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    centerX: {
      type: 'number',
      label: 'Center X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    centerY: {
      type: 'number',
      label: 'Center Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    centerZ: {
      type: 'number',
      label: 'Center Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeBox',
      params: {
        width: params.width,
        depth: params.depth,
        height: params.height,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
      },
    });

    return {
      solid: result,
    };
  },
};
