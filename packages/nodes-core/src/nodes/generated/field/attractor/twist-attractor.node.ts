import type { NodeDefinition } from '@brepflow/types';

interface TwistAttractorParams {
  angle: number;
  height: number;
  radius: number;
  falloff: string;
}

interface TwistAttractorInputs {
  axis: unknown;
}

interface TwistAttractorOutputs {
  field: unknown;
}

export const FieldAttractorTwistAttractorNode: NodeDefinition<
  TwistAttractorInputs,
  TwistAttractorOutputs,
  TwistAttractorParams
> = {
  id: 'Field::TwistAttractor',
  category: 'Field',
  label: 'TwistAttractor',
  description: 'Twist attractor field',
  inputs: {
    axis: {
      type: 'Line',
      label: 'Axis',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'VectorField',
      label: 'Field',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 90,
      min: -360,
      max: 360,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
    },
    falloff: {
      type: 'enum',
      label: 'Falloff',
      default: 'smooth',
      options: ['linear', 'smooth', 'exponential'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorTwist',
      params: {
        axis: inputs.axis,
        angle: params.angle,
        height: params.height,
        radius: params.radius,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
