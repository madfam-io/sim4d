import type { NodeDefinition } from '@brepflow/types';

interface MoveParams {
  x: number;
  y: number;
  z: number;
  copy: boolean;
}

interface MoveInputs {
  shape: unknown;
}

interface MoveOutputs {
  moved: unknown;
}

export const TransformMoveNode: NodeDefinition<MoveInputs, MoveOutputs, MoveParams> = {
  id: 'Transform::Move',
  category: 'Transform',
  label: 'Move',
  description: 'Translate shape in 3D space',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    moved: {
      type: 'Shape',
      label: 'Moved',
    },
  },
  params: {
    x: {
      type: 'number',
      label: 'X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    y: {
      type: 'number',
      label: 'Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    z: {
      type: 'number',
      label: 'Z',
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
      type: 'transformMove',
      params: {
        shape: inputs.shape,
        x: params.x,
        y: params.y,
        z: params.z,
        copy: params.copy,
      },
    });

    return {
      moved: result,
    };
  },
};
