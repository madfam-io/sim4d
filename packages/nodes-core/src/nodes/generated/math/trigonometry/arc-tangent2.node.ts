import type { NodeDefinition } from '@sim4d/types';

interface ArcTangent2Params {
  angleUnit: string;
}

interface ArcTangent2Inputs {
  y: unknown;
  x: unknown;
}

interface ArcTangent2Outputs {
  angle: unknown;
}

export const MathTrigonometryArcTangent2Node: NodeDefinition<
  ArcTangent2Inputs,
  ArcTangent2Outputs,
  ArcTangent2Params
> = {
  id: 'Math::ArcTangent2',
  category: 'Math',
  label: 'ArcTangent2',
  description: 'Two-argument arc tangent',
  inputs: {
    y: {
      type: 'number',
      label: 'Y',
      required: true,
    },
    x: {
      type: 'number',
      label: 'X',
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
      type: 'mathAtan2',
      params: {
        y: inputs.y,
        x: inputs.x,
        angleUnit: params.angleUnit,
      },
    });

    return {
      angle: result,
    };
  },
};
