import type { NodeDefinition } from '@brepflow/types';

interface LoftParams {
  ruled: boolean;
  closed: boolean;
  solid: boolean;
  maxDegree: number;
}

interface LoftInputs {
  profiles: unknown;
  guides?: unknown;
  centerLine?: unknown;
}

interface LoftOutputs {
  shape: unknown;
}

export const AdvancedLoftLoftNode: NodeDefinition<LoftInputs, LoftOutputs, LoftParams> = {
  id: 'Advanced::Loft',
  type: 'Advanced::Loft',
  category: 'Advanced',
  label: 'Loft',
  description: 'Loft between profiles',
  inputs: {
    profiles: {
      type: 'Wire[]',
      label: 'Profiles',
      required: true,
    },
    guides: {
      type: 'Wire[]',
      label: 'Guides',
      optional: true,
    },
    centerLine: {
      type: 'Wire',
      label: 'Center Line',
      optional: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    ruled: {
      type: 'boolean',
      label: 'Ruled',
      default: false,
    },
    closed: {
      type: 'boolean',
      label: 'Closed',
      default: false,
    },
    solid: {
      type: 'boolean',
      label: 'Solid',
      default: true,
    },
    maxDegree: {
      type: 'number',
      label: 'Max Degree',
      default: 3,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'loft',
      params: {
        profiles: inputs.profiles,
        guides: inputs.guides,
        centerLine: inputs.centerLine,
        ruled: params.ruled,
        closed: params.closed,
        solid: params.solid,
        maxDegree: params.maxDegree,
      },
    });

    return {
      shape: result,
    };
  },
};
