import type { NodeDefinition } from '@sim4d/types';

type RangeParams = Record<string, never>;

interface RangeInputs {
  values: unknown;
}

interface RangeOutputs {
  min: unknown;
  max: unknown;
  range: unknown;
}

export const MathStatisticsRangeNode: NodeDefinition<RangeInputs, RangeOutputs, RangeParams> = {
  id: 'Math::Range',
  type: 'Math::Range',
  category: 'Math',
  label: 'Range',
  description: 'Range of values',
  inputs: {
    values: {
      type: 'number[]',
      label: 'Values',
      required: true,
    },
  },
  outputs: {
    min: {
      type: 'number',
      label: 'Min',
    },
    max: {
      type: 'number',
      label: 'Max',
    },
    range: {
      type: 'number',
      label: 'Range',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mathRange',
      params: {
        values: inputs.values,
      },
    });

    return {
      min: results.min,
      max: results.max,
      range: results.range,
    };
  },
};
