import type { NodeDefinition } from '@sim4d/types';

interface WeightedVoronoiParams {
  powerExponent: number;
}

interface WeightedVoronoiInputs {
  points: Array<[number, number, number]>;
  weights: unknown;
}

interface WeightedVoronoiOutputs {
  cells: unknown;
}

export const PatternsVoronoiWeightedVoronoiNode: NodeDefinition<
  WeightedVoronoiInputs,
  WeightedVoronoiOutputs,
  WeightedVoronoiParams
> = {
  id: 'Patterns::WeightedVoronoi',
  category: 'Patterns',
  label: 'WeightedVoronoi',
  description: 'Weighted Voronoi diagram',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    weights: {
      type: 'number[]',
      label: 'Weights',
      required: true,
    },
  },
  outputs: {
    cells: {
      type: 'Wire[]',
      label: 'Cells',
    },
  },
  params: {
    powerExponent: {
      type: 'number',
      label: 'Power Exponent',
      default: 2,
      min: 1,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiWeighted',
      params: {
        points: inputs.points,
        weights: inputs.weights,
        powerExponent: params.powerExponent,
      },
    });

    return {
      cells: result,
    };
  },
};
