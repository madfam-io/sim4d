import type { NodeDefinition } from '@brepflow/types';

interface WedgeParams {
  dx: number;
  dy: number;
  dz: number;
  xmax: number;
  zmin: number;
  zmax: number;
}

type WedgeInputs = Record<string, never>;

interface WedgeOutputs {
  solid: unknown;
}

export const SolidParametricWedgeNode: NodeDefinition<WedgeInputs, WedgeOutputs, WedgeParams> = {
  id: 'Solid::Wedge',
  type: 'Solid::Wedge',
  category: 'Solid',
  label: 'Wedge',
  description: 'Create a wedge solid',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    dx: {
      type: 'number',
      label: 'Dx',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    dy: {
      type: 'number',
      label: 'Dy',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    dz: {
      type: 'number',
      label: 'Dz',
      default: 75,
      min: 0.1,
      max: 10000,
    },
    xmax: {
      type: 'number',
      label: 'Xmax',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    zmin: {
      type: 'number',
      label: 'Zmin',
      default: 25,
      min: 0.1,
      max: 10000,
    },
    zmax: {
      type: 'number',
      label: 'Zmax',
      default: 50,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeWedge',
      params: {
        dx: params.dx,
        dy: params.dy,
        dz: params.dz,
        xmax: params.xmax,
        zmin: params.zmin,
        zmax: params.zmax,
      },
    });

    return {
      solid: result,
    };
  },
};
