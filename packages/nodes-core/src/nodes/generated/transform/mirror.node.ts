import type { NodeDefinition } from '@brepflow/types';

interface MirrorParams {
  planeOriginX: number;
  planeOriginY: number;
  planeOriginZ: number;
  planeNormalX: number;
  planeNormalY: number;
  planeNormalZ: number;
  copy: boolean;
}

interface MirrorInputs {
  shape: unknown;
}

interface MirrorOutputs {
  mirrored: unknown;
}

export const TransformMirrorNode: NodeDefinition<MirrorInputs, MirrorOutputs, MirrorParams> = {
  id: 'Transform::Mirror',
  category: 'Transform',
  label: 'Mirror',
  description: 'Mirror shape across a plane',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    mirrored: {
      type: 'Shape',
      label: 'Mirrored',
    },
  },
  params: {
    planeOriginX: {
      type: 'number',
      label: 'Plane Origin X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    planeOriginY: {
      type: 'number',
      label: 'Plane Origin Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    planeOriginZ: {
      type: 'number',
      label: 'Plane Origin Z',
      default: 0,
      min: -10000,
      max: 10000,
    },
    planeNormalX: {
      type: 'number',
      label: 'Plane Normal X',
      default: 1,
      min: -1,
      max: 1,
    },
    planeNormalY: {
      type: 'number',
      label: 'Plane Normal Y',
      default: 0,
      min: -1,
      max: 1,
    },
    planeNormalZ: {
      type: 'number',
      label: 'Plane Normal Z',
      default: 0,
      min: -1,
      max: 1,
    },
    copy: {
      type: 'boolean',
      label: 'Copy',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformMirror',
      params: {
        shape: inputs.shape,
        planeOriginX: params.planeOriginX,
        planeOriginY: params.planeOriginY,
        planeOriginZ: params.planeOriginZ,
        planeNormalX: params.planeNormalX,
        planeNormalY: params.planeNormalY,
        planeNormalZ: params.planeNormalZ,
        copy: params.copy,
      },
    });

    return {
      mirrored: result,
    };
  },
};
