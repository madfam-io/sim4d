import type { NodeDefinition } from '@sim4d/types';

interface CellularAutomataParams {
  rule: number;
  generations: number;
  cellSize: number;
}

interface CellularAutomataInputs {
  initialState: Array<[number, number, number]>;
}

interface CellularAutomataOutputs {
  cells: unknown;
}

export const PatternsCellularCellularAutomataNode: NodeDefinition<
  CellularAutomataInputs,
  CellularAutomataOutputs,
  CellularAutomataParams
> = {
  id: 'Patterns::CellularAutomata',
  type: 'Patterns::CellularAutomata',
  category: 'Patterns',
  label: 'CellularAutomata',
  description: 'Cellular automaton pattern',
  inputs: {
    initialState: {
      type: 'Point[]',
      label: 'Initial State',
      required: true,
    },
  },
  outputs: {
    cells: {
      type: 'Face[]',
      label: 'Cells',
    },
  },
  params: {
    rule: {
      type: 'number',
      label: 'Rule',
      default: 30,
      min: 0,
      max: 255,
    },
    generations: {
      type: 'number',
      label: 'Generations',
      default: 50,
      min: 1,
      max: 200,
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
      type: 'cellularAutomata',
      params: {
        initialState: inputs.initialState,
        rule: params.rule,
        generations: params.generations,
        cellSize: params.cellSize,
      },
    });

    return {
      cells: result,
    };
  },
};
