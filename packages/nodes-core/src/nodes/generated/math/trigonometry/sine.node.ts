import type { NodeDefinition } from '@brepflow/types';

interface SineParams {
  angleUnit: string;
}

interface SineInputs {
  angle: unknown;
}

interface SineOutputs {
  result: unknown;
}

export const MathTrigonometrySineNode: NodeDefinition<SineInputs, SineOutputs, SineParams> = {
  id: 'Math::Sine',
  category: 'Math',
  label: 'Sine',
  description: 'Sine function',
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
      type: 'mathSin',
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
