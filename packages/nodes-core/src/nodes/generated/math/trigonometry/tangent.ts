import type { NodeDefinition } from '@brepflow/types';

interface TangentParams {
  angleUnit: string;
}

interface TangentInputs {
  angle: unknown;
}

interface TangentOutputs {
  result: unknown;
}

export const MathTrigonometryTangentNode: NodeDefinition<
  TangentInputs,
  TangentOutputs,
  TangentParams
> = {
  id: 'Math::Tangent',
  type: 'Math::Tangent',
  category: 'Math',
  label: 'Tangent',
  description: 'Tangent function',
  inputs: {
    angle: {
      type: 'number',
      label: 'Angle',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'number',
      label: 'Result',
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
      type: 'mathTan',
      params: {
        angle: inputs.angle,
        angleUnit: params.angleUnit,
      },
    });

    return {
      result: result,
    };
  },
};
