import type { NodeDefinition } from '@brepflow/types';

interface PolarArrayParams {
  count: number;
  totalAngle: number;
  centerX: number;
  centerY: number;
  centerZ: number;
  axisX: number;
  axisY: number;
  axisZ: number;
  rotateItems: boolean;
  merge: boolean;
}

interface PolarArrayInputs {
  shape: unknown;
}

interface PolarArrayOutputs {
  array: unknown;
  merged: unknown;
}

export const TransformPolarArrayNode: NodeDefinition<
  PolarArrayInputs,
  PolarArrayOutputs,
  PolarArrayParams
> = {
  id: 'Transform::PolarArray',
  type: 'Transform::PolarArray',
  category: 'Transform',
  label: 'PolarArray',
  description: 'Create circular/polar array',
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
      default: 8,
      min: 2,
      max: 1000,
      step: 1,
    },
    totalAngle: {
      type: 'number',
      label: 'Total Angle',
      default: 360,
      min: 0,
      max: 360,
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
    rotateItems: {
      type: 'boolean',
      label: 'Rotate Items',
      default: true,
    },
    merge: {
      type: 'boolean',
      label: 'Merge',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'transformPolarArray',
      params: {
        shape: inputs.shape,
        count: params.count,
        totalAngle: params.totalAngle,
        centerX: params.centerX,
        centerY: params.centerY,
        centerZ: params.centerZ,
        axisX: params.axisX,
        axisY: params.axisY,
        axisZ: params.axisZ,
        rotateItems: params.rotateItems,
        merge: params.merge,
      },
    });

    return {
      array: results.array,
      merged: results.merged,
    };
  },
};
