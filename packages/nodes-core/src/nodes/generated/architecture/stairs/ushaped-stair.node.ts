import type { NodeDefinition } from '@sim4d/types';

interface UShapedStairParams {
  totalRise: number;
  clearance: number;
}

interface UShapedStairInputs {
  startPoint: [number, number, number];
}

interface UShapedStairOutputs {
  staircase: unknown;
}

export const ArchitectureStairsUShapedStairNode: NodeDefinition<
  UShapedStairInputs,
  UShapedStairOutputs,
  UShapedStairParams
> = {
  id: 'Architecture::UShapedStair',
  category: 'Architecture',
  label: 'UShapedStair',
  description: 'U-shaped staircase',
  inputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
  },
  outputs: {
    staircase: {
      type: 'Shape',
      label: 'Staircase',
    },
  },
  params: {
    totalRise: {
      type: 'number',
      label: 'Total Rise',
      default: 3000,
      min: 1000,
      max: 6000,
    },
    clearance: {
      type: 'number',
      label: 'Clearance',
      default: 100,
      min: 50,
      max: 300,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'uShapedStair',
      params: {
        startPoint: inputs.startPoint,
        totalRise: params.totalRise,
        clearance: params.clearance,
      },
    });

    return {
      staircase: result,
    };
  },
};
