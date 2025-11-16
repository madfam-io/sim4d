import type { NodeDefinition } from '@brepflow/types';

interface ArcSineParams {
  angleUnit: string;
}

interface ArcSineInputs {
  value: unknown;
}

interface ArcSineOutputs {
  angle: unknown;
}

export const MathTrigonometryArcSineNode: NodeDefinition<
  ArcSineInputs,
  ArcSineOutputs,
  ArcSineParams
> = {
  id: 'Math::ArcSine',
  category: 'Math',
  label: 'ArcSine',
  description: 'Arc sine function',
  inputs: {
    value: {
      type: 'number',
      label: 'Value',
      required: true,
    },
  },
  outputs: {
    angle: {
      type: 'number',
      label: 'Angle',
    },
  },
  params: {
    angleUnit: {
      type: 'enum',
      label: 'Angle Unit',
      default: 'radians',
      options: ['radians', 'degrees'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'mathAsin',
      params: {
        value: inputs.value,
        angleUnit: params.angleUnit,
      },
    });

    return {
      angle: result,
    };
  },
};
