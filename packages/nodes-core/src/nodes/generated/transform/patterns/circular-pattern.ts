import type { NodeDefinition } from '@brepflow/types';

interface CircularPatternParams {
  count: number;
  angle: number;
  center: [number, number, number];
  axis: [number, number, number];
  rotateInstances: boolean;
}

interface CircularPatternInputs {
  shape: unknown;
}

interface CircularPatternOutputs {
  shapes: unknown;
  compound: unknown;
}

export const TransformPatternsCircularPatternNode: NodeDefinition<
  CircularPatternInputs,
  CircularPatternOutputs,
  CircularPatternParams
> = {
  id: 'Transform::CircularPattern',
  type: 'Transform::CircularPattern',
  category: 'Transform',
  label: 'CircularPattern',
  description: 'Creates a circular array of features or shapes',
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
      default: 6,
      min: 2,
      max: 1000,
      step: 1,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 360,
      min: 0,
      max: 360,
    },
    center: {
      type: 'vec3',
      label: 'Center',
      default: [0, 0, 0],
    },
    axis: {
      type: 'vec3',
      label: 'Axis',
      default: [0, 0, 1],
    },
    rotateInstances: {
      type: 'boolean',
      label: 'Rotate Instances',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'PATTERN_CIRCULAR',
      params: {
        shape: inputs.shape,
        count: params.count,
        angle: params.angle,
        center: params.center,
        axis: params.axis,
        rotateInstances: params.rotateInstances,
      },
    });

    return {
      shapes: results.shapes,
      compound: results.compound,
    };
  },
};
