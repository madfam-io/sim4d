import type { NodeDefinition } from '@brepflow/types';

interface ArcTangentParams {
  angleUnit: string;
}

interface ArcTangentInputs {
  value: unknown;
}

interface ArcTangentOutputs {
  angle: unknown;
}

export const MathTrigonometryArcTangentNode: NodeDefinition<
  ArcTangentInputs,
  ArcTangentOutputs,
  ArcTangentParams
> = {
  id: 'Math::ArcTangent',
  type: 'Math::ArcTangent',
  category: 'Math',
  label: 'ArcTangent',
  description: 'Arc tangent function',
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
      type: 'mathAtan',
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
