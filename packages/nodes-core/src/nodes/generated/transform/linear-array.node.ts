import type { NodeDefinition } from '@brepflow/types';

interface LinearArrayParams {
  count: number;
  spacingX: number;
  spacingY: number;
  spacingZ: number;
  merge: boolean;
}

interface LinearArrayInputs {
  shape: unknown;
}

interface LinearArrayOutputs {
  array: unknown;
  merged: unknown;
}

export const TransformLinearArrayNode: NodeDefinition<
  LinearArrayInputs,
  LinearArrayOutputs,
  LinearArrayParams
> = {
  id: 'Transform::LinearArray',
  category: 'Transform',
  label: 'LinearArray',
  description: 'Create linear array of shapes',
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
    count: {
      type: 'number',
      label: 'Count',
      default: 5,
      min: 2,
      max: 1000,
      step: 1,
    },
    spacingX: {
      type: 'number',
      label: 'Spacing X',
      default: 100,
      min: -10000,
      max: 10000,
    },
    spacingY: {
      type: 'number',
      label: 'Spacing Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    spacingZ: {
      type: 'number',
      label: 'Spacing Z',
      default: 0,
      min: -10000,
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
      type: 'transformLinearArray',
      params: {
        shape: inputs.shape,
        count: params.count,
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
