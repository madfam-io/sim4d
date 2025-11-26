import type { NodeDefinition } from '@sim4d/types';

interface OffsetSurfaceParams {
  offset: number;
  fillGaps: boolean;
  extend: boolean;
}

interface OffsetSurfaceInputs {
  shape: unknown;
}

interface OffsetSurfaceOutputs {
  offsetShape: unknown;
}

export const AdvancedThicknessOffsetSurfaceNode: NodeDefinition<
  OffsetSurfaceInputs,
  OffsetSurfaceOutputs,
  OffsetSurfaceParams
> = {
  id: 'Advanced::OffsetSurface',
  category: 'Advanced',
  label: 'OffsetSurface',
  description: 'Offset surface or solid',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    offsetShape: {
      type: 'Shape',
      label: 'Offset Shape',
    },
  },
  params: {
    offset: {
      type: 'number',
      label: 'Offset',
      default: 5,
      min: -1000,
      max: 1000,
    },
    fillGaps: {
      type: 'boolean',
      label: 'Fill Gaps',
      default: true,
    },
    extend: {
      type: 'boolean',
      label: 'Extend',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'offsetSurface',
      params: {
        shape: inputs.shape,
        offset: params.offset,
        fillGaps: params.fillGaps,
        extend: params.extend,
      },
    });

    return {
      offsetShape: result,
    };
  },
};
