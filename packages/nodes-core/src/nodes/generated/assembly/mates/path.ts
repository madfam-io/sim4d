import type { NodeDefinition } from '@sim4d/types';

interface PathParams {
  position: number;
  tangent: boolean;
}

interface PathInputs {
  path: unknown;
  follower: unknown;
}

interface PathOutputs {
  pathed: unknown;
  mate: unknown;
}

export const AssemblyMatesPathNode: NodeDefinition<PathInputs, PathOutputs, PathParams> = {
  id: 'Assembly::Path',
  type: 'Assembly::Path',
  category: 'Assembly',
  label: 'Path',
  description: 'Constrain to path',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
    follower: {
      type: 'Shape',
      label: 'Follower',
      required: true,
    },
  },
  outputs: {
    pathed: {
      type: 'Shape[]',
      label: 'Pathed',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    position: {
      type: 'number',
      label: 'Position',
      default: 0,
      min: 0,
      max: 1,
    },
    tangent: {
      type: 'boolean',
      label: 'Tangent',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'matePath',
      params: {
        path: inputs.path,
        follower: inputs.follower,
        position: params.position,
        tangent: params.tangent,
      },
    });

    return {
      pathed: results.pathed,
      mate: results.mate,
    };
  },
};
