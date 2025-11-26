import type { NodeDefinition } from '@sim4d/types';

interface ScaleParams {
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  uniform: boolean;
  centerX: number;
  centerY: number;
  centerZ: number;
  copy: boolean;
}

interface ScaleInputs {
  shape: unknown;
}

interface ScaleOutputs {
  scaled: unknown;
}

export const TransformScaleNode: NodeDefinition<ScaleInputs, ScaleOutputs, ScaleParams> = {
  id: 'Transform::Scale',
  category: 'Transform',
  label: 'Scale',
  description: 'Scale shape uniformly or non-uniformly',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    scaled: {
      type: 'Shape',
      label: 'Scaled',
    },
  },
  params: {
    scaleX: {
      type: 'number',
      label: 'Scale X',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    scaleY: {
      type: 'number',
      label: 'Scale Y',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    scaleZ: {
      type: 'number',
      label: 'Scale Z',
      default: 1,
      min: 0.001,
      max: 1000,
    },
    uniform: {
      type: 'boolean',
      label: 'Uniform',
      default: true,
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
      type: 'transformScale',
      params: {
        shape: inputs.shape,
        scaleX: params.scaleX,
        scaleY: params.scaleY,
        scaleZ: params.scaleZ,
        uniform: params.uniform,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        copy: params.copy,
      },
    });

    return {
      scaled: result,
    };
  },
};
