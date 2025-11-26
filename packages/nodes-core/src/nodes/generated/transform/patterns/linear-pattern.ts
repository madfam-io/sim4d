import type { NodeDefinition } from '@sim4d/types';

interface LinearPatternParams {
  count: number;
  spacing: number;
  direction: [number, number, number];
  centered: boolean;
}

interface LinearPatternInputs {
  shape: unknown;
}

interface LinearPatternOutputs {
  shapes: unknown;
  compound: unknown;
}

export const TransformPatternsLinearPatternNode: NodeDefinition<
  LinearPatternInputs,
  LinearPatternOutputs,
  LinearPatternParams
> = {
  id: 'Transform::LinearPattern',
  type: 'Transform::LinearPattern',
  category: 'Transform',
  label: 'LinearPattern',
  description: 'Creates a linear array of features or shapes',
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
    count: {
      type: 'number',
      label: 'Count',
      default: 5,
      min: 2,
      max: 1000,
      step: 1,
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 20,
      min: 0.1,
      max: 10000,
    },
    direction: {
      type: 'vec3',
      label: 'Direction',
      default: [1, 0, 0],
    },
    centered: {
      type: 'boolean',
      label: 'Centered',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'PATTERN_LINEAR',
      params: {
        shape: inputs.shape,
        count: params.count,
        spacing: params.spacing,
        direction: params.direction,
        centered: params.centered,
      },
    });

    return {
      shapes: results.shapes,
      compound: results.compound,
    };
  },
};
