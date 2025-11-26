import type { NodeDefinition } from '@sim4d/types';

interface BlendSurfaceParams {
  continuity: string;
  blendFactor: number;
}

interface BlendSurfaceInputs {
  surface1: unknown;
  surface2: unknown;
  edge1?: unknown;
  edge2?: unknown;
}

interface BlendSurfaceOutputs {
  blendSurface: unknown;
}

export const AdvancedLoftBlendSurfaceNode: NodeDefinition<
  BlendSurfaceInputs,
  BlendSurfaceOutputs,
  BlendSurfaceParams
> = {
  id: 'Advanced::BlendSurface',
  type: 'Advanced::BlendSurface',
  category: 'Advanced',
  label: 'BlendSurface',
  description: 'Blend between surfaces',
  inputs: {
    surface1: {
      type: 'Face',
      label: 'Surface1',
      required: true,
    },
    surface2: {
      type: 'Face',
      label: 'Surface2',
      required: true,
    },
    edge1: {
      type: 'Edge',
      label: 'Edge1',
      optional: true,
    },
    edge2: {
      type: 'Edge',
      label: 'Edge2',
      optional: true,
    },
  },
  outputs: {
    blendSurface: {
      type: 'Shape',
      label: 'Blend Surface',
    },
  },
  params: {
    continuity: {
      type: 'enum',
      label: 'Continuity',
      default: 'G1',
      options: ['G0', 'G1', 'G2'],
    },
    blendFactor: {
      type: 'number',
      label: 'Blend Factor',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'blendSurface',
      params: {
        surface1: inputs.surface1,
        surface2: inputs.surface2,
        edge1: inputs.edge1,
        edge2: inputs.edge2,
        continuity: params.continuity,
        blendFactor: params.blendFactor,
      },
    });

    return {
      blendSurface: result,
    };
  },
};
