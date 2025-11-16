import type { NodeDefinition } from '@brepflow/types';

interface EllipsoidParams {
  radiusX: number;
  radiusY: number;
  radiusZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
}

type EllipsoidInputs = Record<string, never>;

interface EllipsoidOutputs {
  solid: unknown;
}

export const SolidPrimitivesEllipsoidNode: NodeDefinition<
  EllipsoidInputs,
  EllipsoidOutputs,
  EllipsoidParams
> = {
  id: 'Solid::Ellipsoid',
  category: 'Solid',
  label: 'Ellipsoid',
  description: 'Create a parametric ellipsoid',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    radiusX: {
      type: 'number',
      label: 'Radius X',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    radiusY: {
      type: 'number',
      label: 'Radius Y',
      default: 40,
      min: 0.1,
      max: 10000,
    },
    radiusZ: {
      type: 'number',
      label: 'Radius Z',
      default: 30,
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
      type: 'makeEllipsoid',
      params: {
        radiusX: params.radiusX,
        radiusY: params.radiusY,
        radiusZ: params.radiusZ,
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
