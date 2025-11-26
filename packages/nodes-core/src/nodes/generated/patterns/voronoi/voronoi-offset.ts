import type { NodeDefinition } from '@sim4d/types';

interface VoronoiOffsetParams {
  offset: number;
  roundCorners: boolean;
}

interface VoronoiOffsetInputs {
  cells: unknown;
}

interface VoronoiOffsetOutputs {
  offsetCells: unknown;
}

export const PatternsVoronoiVoronoiOffsetNode: NodeDefinition<
  VoronoiOffsetInputs,
  VoronoiOffsetOutputs,
  VoronoiOffsetParams
> = {
  id: 'Patterns::VoronoiOffset',
  type: 'Patterns::VoronoiOffset',
  category: 'Patterns',
  label: 'VoronoiOffset',
  description: 'Offset Voronoi cells',
  inputs: {
    cells: {
      type: 'Wire[]',
      label: 'Cells',
      required: true,
    },
  },
  outputs: {
    offsetCells: {
      type: 'Wire[]',
      label: 'Offset Cells',
    },
  },
  params: {
    offset: {
      type: 'number',
      label: 'Offset',
      default: 1,
      min: -10,
      max: 10,
    },
    roundCorners: {
      type: 'boolean',
      label: 'Round Corners',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiOffset',
      params: {
        cells: inputs.cells,
        offset: params.offset,
        roundCorners: params.roundCorners,
      },
    });

    return {
      offsetCells: result,
    };
  },
};
