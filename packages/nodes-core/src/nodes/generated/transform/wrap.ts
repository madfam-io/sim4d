import type { NodeDefinition } from '@brepflow/types';

interface WrapParams {
  type: string;
  radius: number;
  angle: number;
}

interface WrapInputs {
  shape: unknown;
}

interface WrapOutputs {
  wrapped: unknown;
}

export const TransformWrapNode: NodeDefinition<WrapInputs, WrapOutputs, WrapParams> = {
  id: 'Transform::Wrap',
  type: 'Transform::Wrap',
  category: 'Transform',
  label: 'Wrap',
  description: 'Wrap shape around cylinder or sphere',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    wrapped: {
      type: 'Shape',
      label: 'Wrapped',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'cylinder',
      options: ['cylinder', 'sphere'],
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 360,
      min: 0,
      max: 360,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'transformWrap',
      params: {
        shape: inputs.shape,
        type: params.type,
        radius: params.radius,
        angle: params.angle,
      },
    });

    return {
      wrapped: result,
    };
  },
};
