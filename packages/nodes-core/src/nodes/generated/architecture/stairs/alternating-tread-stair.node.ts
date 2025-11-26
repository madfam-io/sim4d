import type { NodeDefinition } from '@sim4d/types';

interface AlternatingTreadStairParams {
  angle: number;
  treadWidth: number;
}

interface AlternatingTreadStairInputs {
  startPoint: [number, number, number];
  totalRise: number;
}

interface AlternatingTreadStairOutputs {
  alternatingStair: unknown;
}

export const ArchitectureStairsAlternatingTreadStairNode: NodeDefinition<
  AlternatingTreadStairInputs,
  AlternatingTreadStairOutputs,
  AlternatingTreadStairParams
> = {
  id: 'Architecture::AlternatingTreadStair',
  category: 'Architecture',
  label: 'AlternatingTreadStair',
  description: 'Alternating tread device',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
    totalRise: {
      type: 'Number',
      label: 'Total Rise',
      required: true,
    },
  },
  outputs: {
    alternatingStair: {
      type: 'Shape',
      label: 'Alternating Stair',
    },
  },
  params: {
    angle: {
      type: 'number',
      label: 'Angle',
      default: 56,
      min: 50,
      max: 70,
    },
    treadWidth: {
      type: 'number',
      label: 'Tread Width',
      default: 600,
      min: 500,
      max: 700,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'alternatingTreadStair',
      params: {
        startPoint: inputs.startPoint,
        totalRise: inputs.totalRise,
        angle: params.angle,
        treadWidth: params.treadWidth,
      },
    });

    return {
      alternatingStair: result,
    };
  },
};
