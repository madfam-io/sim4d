import type { NodeDefinition } from '@brepflow/types';

interface ConeParams {
  radius1: number;
  radius2: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  angle: number;
}

type ConeInputs = Record<string, never>;

interface ConeOutputs {
  solid: unknown;
}

export const SolidPrimitivesConeNode: NodeDefinition<ConeInputs, ConeOutputs, ConeParams> = {
  id: 'Solid::Cone',
  type: 'Solid::Cone',
  category: 'Solid',
  label: 'Cone',
  description: 'Create a parametric cone or truncated cone',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    radius1: {
      type: 'number',
      label: 'Radius1',
      default: 50,
      min: 0,
      max: 10000,
    },
    radius2: {
      type: 'number',
      label: 'Radius2',
      default: 0,
      min: 0,
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
    angle: {
      type: 'number',
      label: 'Angle',
      default: 360,
      min: 0,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeCone',
      params: {
        radius1: params.radius1,
        radius2: params.radius2,
        height: params.height,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        angle: params.angle,
      },
    });

    return {
      solid: result,
    };
  },
};
