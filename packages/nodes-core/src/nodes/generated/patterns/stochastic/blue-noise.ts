import type { NodeDefinition } from '@brepflow/types';

interface BlueNoiseParams {
  count: number;
  minDistance: number;
}

interface BlueNoiseInputs {
  boundary: unknown;
}

interface BlueNoiseOutputs {
  points: Array<[number, number, number]>;
}

export const PatternsStochasticBlueNoiseNode: NodeDefinition<
  BlueNoiseInputs,
  BlueNoiseOutputs,
  BlueNoiseParams
> = {
  id: 'Patterns::BlueNoise',
  type: 'Patterns::BlueNoise',
  category: 'Patterns',
  label: 'BlueNoise',
  description: 'Blue noise distribution',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
    },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 100,
      min: 10,
      max: 10000,
      step: 10,
    },
    minDistance: {
      type: 'number',
      label: 'Min Distance',
      default: 1,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'blueNoise',
      params: {
        boundary: inputs.boundary,
        count: params.count,
        minDistance: params.minDistance,
      },
    });

    return {
      points: result,
    };
  },
};
