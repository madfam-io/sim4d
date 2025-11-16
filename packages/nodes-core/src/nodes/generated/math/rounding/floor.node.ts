import type { NodeDefinition } from '@brepflow/types';

type FloorParams = Record<string, never>;

interface FloorInputs {
  value: unknown;
}

interface FloorOutputs {
  result: unknown;
}

export const MathRoundingFloorNode: NodeDefinition<FloorInputs, FloorOutputs, FloorParams> = {
  id: 'Math::Floor',
  category: 'Math',
  label: 'Floor',
  description: 'Round down',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathFloor',
      params: {
        value: inputs.value,
      },
    });

    return {
      result: result,
    };
  },
};
