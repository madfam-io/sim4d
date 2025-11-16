import type { NodeDefinition } from '@brepflow/types';

interface GridArrayParams {
  countX: number;
  countY: number;
  countZ: number;
  spacingX: number;
  spacingY: number;
  spacingZ: number;
  merge: boolean;
}

interface GridArrayInputs {
  shape: unknown;
}

interface GridArrayOutputs {
  array: unknown;
  merged: unknown;
}

export const TransformGridArrayNode: NodeDefinition<
  GridArrayInputs,
  GridArrayOutputs,
  GridArrayParams
> = {
  id: 'Transform::GridArray',
  category: 'Transform',
  label: 'GridArray',
  description: 'Create 2D or 3D grid array',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    array: {
      type: 'Shape[]',
      label: 'Array',
    },
    merged: {
      type: 'Shape',
      label: 'Merged',
    },
  },
  params: {
    countX: {
      type: 'number',
      label: 'Count X',
      default: 3,
      min: 1,
      max: 100,
      step: 1,
    },
    countY: {
      type: 'number',
      label: 'Count Y',
      default: 3,
      min: 1,
      max: 100,
      step: 1,
    },
    countZ: {
      type: 'number',
      label: 'Count Z',
      default: 1,
      min: 1,
      max: 100,
      step: 1,
    },
    spacingX: {
      type: 'number',
      label: 'Spacing X',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    spacingY: {
      type: 'number',
      label: 'Spacing Y',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    spacingZ: {
      type: 'number',
      label: 'Spacing Z',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    merge: {
      type: 'boolean',
      label: 'Merge',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'transformGridArray',
      params: {
        shape: inputs.shape,
        countX: params.countX,
        countY: params.countY,
        countZ: params.countZ,
        spacingX: params.spacingX,
        spacingY: params.spacingY,
        spacingZ: params.spacingZ,
        merge: params.merge,
      },
    });

    return {
      array: results.array,
      merged: results.merged,
    };
  },
};
