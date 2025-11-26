import type { NodeDefinition } from '@sim4d/types';

interface MazeGeneratorParams {
  algorithm: string;
  width: number;
  height: number;
}

interface MazeGeneratorInputs {
  boundary: unknown;
}

interface MazeGeneratorOutputs {
  walls: unknown;
  path: unknown;
}

export const PatternsAlgorithmicMazeGeneratorNode: NodeDefinition<
  MazeGeneratorInputs,
  MazeGeneratorOutputs,
  MazeGeneratorParams
> = {
  id: 'Patterns::MazeGenerator',
  category: 'Patterns',
  label: 'MazeGenerator',
  description: 'Maze generation algorithms',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    walls: {
      type: 'Wire[]',
      label: 'Walls',
    },
    path: {
      type: 'Wire',
      label: 'Path',
    },
  },
  params: {
    algorithm: {
      type: 'enum',
      label: 'Algorithm',
      default: 'recursive-backtracker',
      options: ['recursive-backtracker', 'prims', 'kruskals', 'wilsons'],
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 5,
      max: 100,
      step: 1,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 20,
      min: 5,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mazeGenerator',
      params: {
        boundary: inputs.boundary,
        algorithm: params.algorithm,
        width: params.width,
        height: params.height,
      },
    });

    return {
      walls: results.walls,
      path: results.path,
    };
  },
};
