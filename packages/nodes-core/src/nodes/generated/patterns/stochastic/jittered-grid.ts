import type { NodeDefinition } from '@sim4d/types';

interface JitteredGridParams {
  gridSize: number;
  jitter: number;
}

interface JitteredGridInputs {
  boundary: unknown;
}

interface JitteredGridOutputs {
  points: Array<[number, number, number]>;
}

export const PatternsStochasticJitteredGridNode: NodeDefinition<
  JitteredGridInputs,
  JitteredGridOutputs,
  JitteredGridParams
> = {
  id: 'Patterns::JitteredGrid',
  type: 'Patterns::JitteredGrid',
  category: 'Patterns',
  label: 'JitteredGrid',
  description: 'Jittered grid sampling',
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
    gridSize: {
      type: 'number',
      label: 'Grid Size',
      default: 10,
      min: 2,
      max: 100,
      step: 1,
    },
    jitter: {
      type: 'number',
      label: 'Jitter',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jitteredGrid',
      params: {
        boundary: inputs.boundary,
        gridSize: params.gridSize,
        jitter: params.jitter,
      },
    });

    return {
      points: result,
    };
  },
};
