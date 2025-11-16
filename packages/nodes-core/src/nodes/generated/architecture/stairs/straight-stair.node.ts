import type { NodeDefinition } from '@brepflow/types';

interface StraightStairParams {
  totalRise: number;
  treadDepth: number;
  riserHeight: number;
  width: number;
}

interface StraightStairInputs {
  startPoint: [number, number, number];
}

interface StraightStairOutputs {
  staircase: unknown;
  treads: unknown;
  risers: unknown;
}

export const ArchitectureStairsStraightStairNode: NodeDefinition<
  StraightStairInputs,
  StraightStairOutputs,
  StraightStairParams
> = {
  id: 'Architecture::StraightStair',
  category: 'Architecture',
  label: 'StraightStair',
  description: 'Straight run staircase',
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
    treads: {
      type: 'Shape[]',
      label: 'Treads',
    },
    risers: {
      type: 'Shape[]',
      label: 'Risers',
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
    treadDepth: {
      type: 'number',
      label: 'Tread Depth',
      default: 280,
      min: 250,
      max: 350,
    },
    riserHeight: {
      type: 'number',
      label: 'Riser Height',
      default: 175,
      min: 150,
      max: 200,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 1200,
      min: 900,
      max: 2000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'straightStair',
      params: {
        startPoint: inputs.startPoint,
        totalRise: params.totalRise,
        treadDepth: params.treadDepth,
        riserHeight: params.riserHeight,
        width: params.width,
      },
    });

    return {
      staircase: results.staircase,
      treads: results.treads,
      risers: results.risers,
    };
  },
};
