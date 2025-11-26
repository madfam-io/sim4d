import type { NodeDefinition } from '@sim4d/types';

interface RoundedBoxParams {
  width: number;
  depth: number;
  height: number;
  radius: number;
}

type RoundedBoxInputs = Record<string, never>;

interface RoundedBoxOutputs {
  solid: unknown;
}

export const SolidPrimitivesRoundedBoxNode: NodeDefinition<
  RoundedBoxInputs,
  RoundedBoxOutputs,
  RoundedBoxParams
> = {
  id: 'Solid::RoundedBox',
  category: 'Solid',
  label: 'RoundedBox',
  description: 'Create a box with rounded edges',
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
    radius: {
      type: 'number',
      label: 'Radius',
      default: 10,
      min: 0.1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeRoundedBox',
      params: {
        width: params.width,
        depth: params.depth,
        height: params.height,
        radius: params.radius,
      },
    });

    return {
      solid: result,
    };
  },
};
