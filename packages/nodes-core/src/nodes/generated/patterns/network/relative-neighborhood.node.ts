import type { NodeDefinition } from '@brepflow/types';

type RelativeNeighborhoodParams = Record<string, never>;

interface RelativeNeighborhoodInputs {
  points: Array<[number, number, number]>;
}

interface RelativeNeighborhoodOutputs {
  network: unknown;
}

export const PatternsNetworkRelativeNeighborhoodNode: NodeDefinition<
  RelativeNeighborhoodInputs,
  RelativeNeighborhoodOutputs,
  RelativeNeighborhoodParams
> = {
  id: 'Patterns::RelativeNeighborhood',
  category: 'Patterns',
  label: 'RelativeNeighborhood',
  description: 'RNG network pattern',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    network: {
      type: 'Wire[]',
      label: 'Network',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'relativeNeighborhood',
      params: {
        points: inputs.points,
      },
    });

    return {
      network: result,
    };
  },
};
