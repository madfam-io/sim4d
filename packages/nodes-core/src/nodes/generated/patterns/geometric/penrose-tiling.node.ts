import type { NodeDefinition } from '@brepflow/types';

interface PenroseTilingParams {
  type: string;
  subdivisions: number;
}

interface PenroseTilingInputs {
  boundary: unknown;
}

interface PenroseTilingOutputs {
  tiles: unknown;
}

export const PatternsGeometricPenroseTilingNode: NodeDefinition<
  PenroseTilingInputs,
  PenroseTilingOutputs,
  PenroseTilingParams
> = {
  id: 'Patterns::PenroseTiling',
  category: 'Patterns',
  label: 'PenroseTiling',
  description: 'Penrose aperiodic tiling',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    tiles: {
      type: 'Face[]',
      label: 'Tiles',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'P2',
      options: ['P1', 'P2', 'P3'],
    },
    subdivisions: {
      type: 'number',
      label: 'Subdivisions',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'penroseTiling',
      params: {
        boundary: inputs.boundary,
        type: params.type,
        subdivisions: params.subdivisions,
      },
    });

    return {
      tiles: result,
    };
  },
};
