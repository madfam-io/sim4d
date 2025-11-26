import type { NodeDefinition } from '@sim4d/types';

type RemapParams = Record<string, never>;

interface RemapInputs {
  value: unknown;
  fromMin: unknown;
  fromMax: unknown;
  toMin: unknown;
  toMax: unknown;
}

interface RemapOutputs {
  remapped: unknown;
}

export const MathInterpolationRemapNode: NodeDefinition<RemapInputs, RemapOutputs, RemapParams> = {
  id: 'Math::Remap',
  category: 'Math',
  label: 'Remap',
  description: 'Remap value to new range',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
    fromMin: {
      type: 'number',
      label: 'From Min',
      required: true,
    },
    fromMax: {
      type: 'number',
      label: 'From Max',
      required: true,
    },
    toMin: {
      type: 'number',
      label: 'To Min',
      required: true,
    },
    toMax: {
      type: 'number',
      label: 'To Max',
      required: true,
    },
  },
  outputs: {
    remapped: {
      type: 'number',
      label: 'Remapped',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathRemap',
      params: {
        value: inputs.value,
        fromMin: inputs.fromMin,
        fromMax: inputs.fromMax,
        toMin: inputs.toMin,
        toMax: inputs.toMax,
      },
    });

    return {
      remapped: result,
    };
  },
};
