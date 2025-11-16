import type { NodeDefinition } from '@brepflow/types';

interface MedialAxisParams {
  resolution: number;
  pruning: number;
  simplify: boolean;
}

interface MedialAxisInputs {
  shape: unknown;
}

interface MedialAxisOutputs {
  skeleton: unknown;
  branchPoints: Array<[number, number, number]>;
  endpoints: Array<[number, number, number]>;
}

export const AlgorithmicGeometryMedialAxisNode: NodeDefinition<
  MedialAxisInputs,
  MedialAxisOutputs,
  MedialAxisParams
> = {
  id: 'Algorithmic::MedialAxis',
  category: 'Algorithmic',
  label: 'MedialAxis',
  description: 'Compute medial axis/skeleton',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    skeleton: {
      type: 'Wire[]',
      label: 'Skeleton',
    },
    branchPoints: {
      type: 'Point[]',
      label: 'Branch Points',
    },
    endpoints: {
      type: 'Point[]',
      label: 'Endpoints',
    },
  },
  params: {
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 0.1,
      min: 0.01,
      max: 1,
    },
    pruning: {
      type: 'number',
      label: 'Pruning',
      default: 0.1,
      min: 0,
      max: 1,
    },
    simplify: {
      type: 'boolean',
      label: 'Simplify',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'medialAxis',
      params: {
        shape: inputs.shape,
        resolution: params.resolution,
        pruning: params.pruning,
        simplify: params.simplify,
      },
    });

    return {
      skeleton: results.skeleton,
      branchPoints: results.branchPoints,
      endpoints: results.endpoints,
    };
  },
};
