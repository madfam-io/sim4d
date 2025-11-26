import type { NodeDefinition } from '@sim4d/types';

interface RectangularPatternParams {
  countX: number;
  countY: number;
  spacingX: number;
  spacingY: number;
  staggered: boolean;
}

interface RectangularPatternInputs {
  shape: unknown;
}

interface RectangularPatternOutputs {
  shapes: unknown;
  compound: unknown;
}

export const TransformPatternsRectangularPatternNode: NodeDefinition<
  RectangularPatternInputs,
  RectangularPatternOutputs,
  RectangularPatternParams
> = {
  id: 'Transform::RectangularPattern',
  category: 'Transform',
  label: 'RectangularPattern',
  description: 'Creates a 2D rectangular grid pattern',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
    },
    compound: {
      type: 'Shape',
      label: 'Compound',
    },
  },
  params: {
    countX: {
      type: 'number',
      label: 'Count X',
      default: 4,
      min: 1,
      max: 100,
    },
    countY: {
      type: 'number',
      label: 'Count Y',
      default: 3,
      min: 1,
      max: 100,
    },
    spacingX: {
      type: 'number',
      label: 'Spacing X',
      default: 20,
      min: 0.1,
      max: 10000,
    },
    spacingY: {
      type: 'number',
      label: 'Spacing Y',
      default: 20,
      min: 0.1,
      max: 10000,
    },
    staggered: {
      type: 'boolean',
      label: 'Staggered',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'PATTERN_RECTANGULAR',
      params: {
        shape: inputs.shape,
        countX: params.countX,
        countY: params.countY,
        spacingX: params.spacingX,
        spacingY: params.spacingY,
        staggered: params.staggered,
      },
    });

    return {
      shapes: results.shapes,
      compound: results.compound,
    };
  },
};
