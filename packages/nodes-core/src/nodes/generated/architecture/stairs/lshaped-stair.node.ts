import type { NodeDefinition } from '@sim4d/types';

interface LShapedStairParams {
  totalRise: number;
  landingSize: number;
  turnDirection: string;
}

interface LShapedStairInputs {
  startPoint: [number, number, number];
}

interface LShapedStairOutputs {
  staircase: unknown;
  landing: unknown;
}

export const ArchitectureStairsLShapedStairNode: NodeDefinition<
  LShapedStairInputs,
  LShapedStairOutputs,
  LShapedStairParams
> = {
  id: 'Architecture::LShapedStair',
  category: 'Architecture',
  label: 'LShapedStair',
  description: 'L-shaped staircase',
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
    landing: {
      type: 'Shape',
      label: 'Landing',
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
    landingSize: {
      type: 'number',
      label: 'Landing Size',
      default: 1200,
      min: 900,
      max: 2000,
    },
    turnDirection: {
      type: 'enum',
      label: 'Turn Direction',
      default: 'right',
      options: ['left', 'right'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'lShapedStair',
      params: {
        startPoint: inputs.startPoint,
        totalRise: params.totalRise,
        landingSize: params.landingSize,
        turnDirection: params.turnDirection,
      },
    });

    return {
      staircase: results.staircase,
      landing: results.landing,
    };
  },
};
