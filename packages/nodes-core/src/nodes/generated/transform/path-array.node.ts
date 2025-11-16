import type { NodeDefinition } from '@brepflow/types';

interface PathArrayParams {
  count: number;
  alignToPath: boolean;
  spacing: string;
  distance: number;
  merge: boolean;
}

interface PathArrayInputs {
  shape: unknown;
  path: unknown;
}

interface PathArrayOutputs {
  array: unknown;
  merged: unknown;
}

export const TransformPathArrayNode: NodeDefinition<
  PathArrayInputs,
  PathArrayOutputs,
  PathArrayParams
> = {
  id: 'Transform::PathArray',
  category: 'Transform',
  label: 'PathArray',
  description: 'Array shapes along a path',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
    path: {
      type: 'Wire',
      label: 'Path',
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
      default: 10,
      min: 2,
      max: 1000,
      step: 1,
    },
    alignToPath: {
      type: 'boolean',
      label: 'Align To Path',
      default: true,
    },
    spacing: {
      type: 'enum',
      label: 'Spacing',
      default: 'equal',
      options: ['equal', 'distance'],
    },
    distance: {
      type: 'number',
      label: 'Distance',
      default: 50,
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
      type: 'transformPathArray',
      params: {
        shape: inputs.shape,
        path: inputs.path,
        count: params.count,
        alignToPath: params.alignToPath,
        spacing: params.spacing,
        distance: params.distance,
        merge: params.merge,
      },
    });

    return {
      array: results.array,
      merged: results.merged,
    };
  },
};
