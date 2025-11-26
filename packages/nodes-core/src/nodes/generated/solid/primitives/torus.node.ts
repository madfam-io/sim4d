import type { NodeDefinition } from '@sim4d/types';

interface TorusParams {
  majorRadius: number;
  minorRadius: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  angle1: number;
  angle2: number;
  angle: number;
}

type TorusInputs = Record<string, never>;

interface TorusOutputs {
  solid: unknown;
}

export const SolidPrimitivesTorusNode: NodeDefinition<TorusInputs, TorusOutputs, TorusParams> = {
  id: 'Solid::Torus',
  category: 'Solid',
  label: 'Torus',
  description: 'Create a parametric torus',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    majorRadius: {
      type: 'number',
      label: 'Major Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    minorRadius: {
      type: 'number',
      label: 'Minor Radius',
      default: 10,
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
    angle1: {
      type: 'number',
      label: 'Angle1',
      default: 0,
      min: 0,
      max: 360,
    },
    angle2: {
      type: 'number',
      label: 'Angle2',
      default: 360,
      min: 0,
      max: 360,
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
      type: 'makeTorus',
      params: {
        majorRadius: params.majorRadius,
        minorRadius: params.minorRadius,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        angle1: params.angle1,
        angle2: params.angle2,
        angle: params.angle,
      },
    });

    return {
      solid: result,
    };
  },
};
