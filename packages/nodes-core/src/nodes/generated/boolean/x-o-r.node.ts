import { NodeDefinition } from '@sim4d/types';

interface Params {
  keepOriginals: boolean;
  fuzzyValue: number;
}
interface Inputs {
  shapes: Shape[];
}
interface Outputs {
  result: Shape;
}

export const XORNode: NodeDefinition<XORInputs, XOROutputs, XORParams> = {
  type: 'Boolean::XOR',
  category: 'Boolean',

  metadata: {
    label: 'XOR',
    description: 'Exclusive OR - keep non-overlapping regions',
  },

  params: {
    keepOriginals: {
      default: false,
    },
    fuzzyValue: {
      default: 1e-7,
      min: 0,
      max: 1,
    },
  },

  inputs: {
    shapes: 'Shape[]',
  },

  outputs: {
    result: 'Shape',
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
