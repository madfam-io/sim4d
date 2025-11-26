import type { NodeDefinition } from '@sim4d/types';

interface WaveFunctionCollapseParams {
  tilesetSize: number;
  gridWidth: number;
  gridHeight: number;
}

interface WaveFunctionCollapseInputs {
  tileset: unknown;
}

interface WaveFunctionCollapseOutputs {
  pattern: unknown;
}

export const PatternsProceduralWaveFunctionCollapseNode: NodeDefinition<
  WaveFunctionCollapseInputs,
  WaveFunctionCollapseOutputs,
  WaveFunctionCollapseParams
> = {
  id: 'Patterns::WaveFunctionCollapse',
  category: 'Patterns',
  label: 'WaveFunctionCollapse',
  description: 'WFC pattern generation',
  inputs: {
    tileset: {
      type: 'Face[]',
      label: 'Tileset',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Face[]',
      label: 'Pattern',
    },
  },
  params: {
    tilesetSize: {
      type: 'number',
      label: 'Tileset Size',
      default: 5,
      min: 2,
      max: 20,
      step: 1,
    },
    gridWidth: {
      type: 'number',
      label: 'Grid Width',
      default: 20,
      min: 5,
      max: 100,
      step: 1,
    },
    gridHeight: {
      type: 'number',
      label: 'Grid Height',
      default: 20,
      min: 5,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'waveFunctionCollapse',
      params: {
        tileset: inputs.tileset,
        tilesetSize: params.tilesetSize,
        gridWidth: params.gridWidth,
        gridHeight: params.gridHeight,
      },
    });

    return {
      pattern: result,
    };
  },
};
