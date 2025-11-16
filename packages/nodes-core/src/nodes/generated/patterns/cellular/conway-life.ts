import type { NodeDefinition } from '@brepflow/types';

interface ConwayLifeParams {
  generations: number;
  cellSize: number;
}

interface ConwayLifeInputs {
  initialCells: Array<[number, number, number]>;
}

interface ConwayLifeOutputs {
  liveCells: unknown;
}

export const PatternsCellularConwayLifeNode: NodeDefinition<
  ConwayLifeInputs,
  ConwayLifeOutputs,
  ConwayLifeParams
> = {
  id: 'Patterns::ConwayLife',
  type: 'Patterns::ConwayLife',
  category: 'Patterns',
  label: 'ConwayLife',
  description: 'Conway Game of Life',
  inputs: {
    initialCells: {
      type: 'Point[]',
      label: 'Initial Cells',
      required: true,
    },
  },
  outputs: {
    liveCells: {
      type: 'Face[]',
      label: 'Live Cells',
    },
  },
  params: {
    generations: {
      type: 'number',
      label: 'Generations',
      default: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    cellSize: {
      type: 'number',
      label: 'Cell Size',
      default: 1,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'conwayLife',
      params: {
        initialCells: inputs.initialCells,
        generations: params.generations,
        cellSize: params.cellSize,
      },
    });

    return {
      liveCells: result,
    };
  },
};
