import type { NodeDefinition } from '@brepflow/types';

interface XORParams {
  keepOriginals: boolean;
  fuzzyValue: number;
}

interface XORInputs {
  shapes: unknown;
}

interface XOROutputs {
  result: unknown;
}

export const BooleanXORNode: NodeDefinition<XORInputs, XOROutputs, XORParams> = {
  id: 'Boolean::XOR',
  type: 'Boolean::XOR',
  category: 'Boolean',
  label: 'XOR',
  description: 'Exclusive OR - keep non-overlapping regions',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    keepOriginals: {
      type: 'boolean',
      label: 'Keep Originals',
      default: false,
    },
    fuzzyValue: {
      type: 'number',
      label: 'Fuzzy Value',
      default: 1e-7,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanXOR',
      params: {
        shapes: inputs.shapes,
        keepOriginals: params.keepOriginals,
        fuzzyValue: params.fuzzyValue,
      },
    });

    return {
      result: result,
    };
  },
};
