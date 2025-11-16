import type { NodeDefinition } from '@brepflow/types';

interface ArcCosineParams {
  angleUnit: string;
}

interface ArcCosineInputs {
  value: unknown;
}

interface ArcCosineOutputs {
  angle: unknown;
}

export const MathTrigonometryArcCosineNode: NodeDefinition<
  ArcCosineInputs,
  ArcCosineOutputs,
  ArcCosineParams
> = {
  id: 'Math::ArcCosine',
  type: 'Math::ArcCosine',
  category: 'Math',
  label: 'ArcCosine',
  description: 'Arc cosine function',
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
      type: 'mathAcos',
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
