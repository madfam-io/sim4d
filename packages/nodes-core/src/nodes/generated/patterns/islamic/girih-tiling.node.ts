import type { NodeDefinition } from '@brepflow/types';

interface GirihTilingParams {
  type: string;
  size: number;
}

interface GirihTilingInputs {
  plane?: unknown;
}

interface GirihTilingOutputs {
  tiles: unknown;
  pattern: unknown;
}

export const PatternsIslamicGirihTilingNode: NodeDefinition<
  GirihTilingInputs,
  GirihTilingOutputs,
  GirihTilingParams
> = {
  id: 'Patterns::GirihTiling',
  category: 'Patterns',
  label: 'GirihTiling',
  description: 'Girih pentagonal tiling',
  inputs: {
    plane: {
      type: 'Plane',
      label: 'Plane',
      optional: true,
    },
  },
  outputs: {
    tiles: {
      type: 'Face[]',
      label: 'Tiles',
    },
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'pentagon',
      options: ['pentagon', 'hexagon', 'bow-tie', 'rhombus', 'decagon'],
    },
    size: {
      type: 'number',
      label: 'Size',
      default: 10,
      min: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'girihTiling',
      params: {
        plane: inputs.plane,
        type: params.type,
        size: params.size,
      },
    });

    return {
      tiles: results.tiles,
      pattern: results.pattern,
    };
  },
};
