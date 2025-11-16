import type { NodeDefinition } from '@brepflow/types';

interface UnionParams {
  keepOriginals: boolean;
  fuzzyValue: number;
}

interface UnionInputs {
  shapes: unknown;
}

interface UnionOutputs {
  result: unknown;
}

export const BooleanUnionNode: NodeDefinition<UnionInputs, UnionOutputs, UnionParams> = {
  id: 'Boolean::Union',
  category: 'Boolean',
  label: 'Union',
  description: 'Combine multiple shapes into one',
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
      type: 'booleanUnion',
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
