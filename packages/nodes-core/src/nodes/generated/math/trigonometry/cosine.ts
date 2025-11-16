import type { NodeDefinition } from '@brepflow/types';

interface CosineParams {
  angleUnit: string;
}

interface CosineInputs {
  angle: unknown;
}

interface CosineOutputs {
  result: unknown;
}

export const MathTrigonometryCosineNode: NodeDefinition<CosineInputs, CosineOutputs, CosineParams> =
  {
    id: 'Math::Cosine',
    type: 'Math::Cosine',
    category: 'Math',
    label: 'Cosine',
    description: 'Cosine function',
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
        type: 'mathCos',
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
