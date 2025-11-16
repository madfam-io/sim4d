import type { NodeDefinition } from '@brepflow/types';

interface RectanglePackingParams {
  algorithm: string;
}

interface RectanglePackingInputs {
  container: unknown;
  rectangles: unknown;
}

interface RectanglePackingOutputs {
  packed: unknown;
  transforms: unknown;
}

export const PatternsPackingRectanglePackingNode: NodeDefinition<
  RectanglePackingInputs,
  RectanglePackingOutputs,
  RectanglePackingParams
> = {
  id: 'Patterns::RectanglePacking',
  type: 'Patterns::RectanglePacking',
  category: 'Patterns',
  label: 'RectanglePacking',
  description: 'Rectangle packing algorithm',
  inputs: {
    container: {
      type: 'Face',
      label: 'Container',
      required: true,
    },
    rectangles: {
      type: 'Face[]',
      label: 'Rectangles',
      required: true,
    },
  },
  outputs: {
    packed: {
      type: 'Face[]',
      label: 'Packed',
    },
    transforms: {
      type: 'Transform[]',
      label: 'Transforms',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'maxrects',
      options: ['guillotine', 'maxrects', 'skyline', 'shelf'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rectanglePacking',
      params: {
        container: inputs.container,
        rectangles: inputs.rectangles,
        algorithm: params.algorithm,
      },
    });

    return {
      packed: results.packed,
      transforms: results.transforms,
    };
  },
};
