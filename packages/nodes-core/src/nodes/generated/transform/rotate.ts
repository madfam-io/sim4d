import type { NodeDefinition } from '@brepflow/types';

interface RotateParams {
  angle: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  copy: boolean;
}

interface RotateInputs {
  shape: unknown;
}

interface RotateOutputs {
  rotated: unknown;
}

export const TransformRotateNode: NodeDefinition<RotateInputs, RotateOutputs, RotateParams> = {
  id: 'Transform::Rotate',
  type: 'Transform::Rotate',
  category: 'Transform',
  label: 'Rotate',
  description: 'Rotate shape around axis',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    rotated: {
      type: 'Shape',
      label: 'Rotated',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 45,
      min: -360,
      max: 360,
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
    copy: {
      type: 'boolean',
      label: 'Copy',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformRotate',
      params: {
        shape: inputs.shape,
        angle: params.angle,
        axisX: params.axisX,
        axisY: params.axisY,
        axisZ: params.axisZ,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        copy: params.copy,
      },
    });

    return {
      rotated: result,
    };
  },
};
