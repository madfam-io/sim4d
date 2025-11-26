import type { NodeDefinition } from '@sim4d/types';

interface TruchetTilesParams {
  tileType: string;
  randomSeed: number;
}

interface TruchetTilesInputs {
  grid: unknown;
}

interface TruchetTilesOutputs {
  pattern: unknown;
}

export const PatternsGeometricTruchetTilesNode: NodeDefinition<
  TruchetTilesInputs,
  TruchetTilesOutputs,
  TruchetTilesParams
> = {
  id: 'Patterns::TruchetTiles',
  type: 'Patterns::TruchetTiles',
  category: 'Patterns',
  label: 'TruchetTiles',
  description: 'Truchet tile pattern',
  inputs: {
    grid: {
      type: 'Face[]',
      label: 'Grid',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    tileType: {
      type: 'enum',
      label: 'Tile Type',
      default: 'arc',
      options: ['arc', 'diagonal', 'smith', 'multi'],
    },
    randomSeed: {
      type: 'number',
      label: 'Random Seed',
      default: 0,
      min: 0,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'truchetTiles',
      params: {
        grid: inputs.grid,
        tileType: params.tileType,
        randomSeed: params.randomSeed,
      },
    });

    return {
      pattern: result,
    };
  },
};
