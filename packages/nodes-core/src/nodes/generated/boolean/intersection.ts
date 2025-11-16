import type { NodeDefinition } from '@brepflow/types';

interface IntersectionParams {
  keepOriginals: boolean;
  fuzzyValue: number;
}

interface IntersectionInputs {
  shapes: unknown;
}

interface IntersectionOutputs {
  result: unknown;
}

export const BooleanIntersectionNode: NodeDefinition<
  IntersectionInputs,
  IntersectionOutputs,
  IntersectionParams
> = {
  id: 'Boolean::Intersection',
  type: 'Boolean::Intersection',
  category: 'Boolean',
  label: 'Intersection',
  description: 'Keep only overlapping regions',
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
      type: 'booleanIntersection',
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
