import type { NodeDefinition } from '@brepflow/types';

interface CylinderParams {
  radius: number;
  height: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  angle: number;
}

type CylinderInputs = Record<string, never>;

interface CylinderOutputs {
  solid: unknown;
}

export const SolidPrimitivesCylinderNode: NodeDefinition<
  CylinderInputs,
  CylinderOutputs,
  CylinderParams
> = {
  id: 'Solid::Cylinder',
  category: 'Solid',
  label: 'Cylinder',
  description: 'Create a parametric cylinder',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
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
    axisX: {
      type: 'number',
      label: 'Axis X',
      default: 0,
      min: -1,
      max: 1,
    },
    axisY: {
      type: 'number',
      label: 'Axis Y',
      default: 0,
      min: -1,
      max: 1,
    },
    axisZ: {
      type: 'number',
      label: 'Axis Z',
      default: 1,
      min: -1,
      max: 1,
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
      type: 'makeCylinder',
      params: {
        radius: params.radius,
        height: params.height,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        axisX: params.axisX,
        axisY: params.axisY,
        axisZ: params.axisZ,
        angle: params.angle,
      },
    });

    return {
      solid: result,
    };
  },
};
