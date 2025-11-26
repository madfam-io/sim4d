import type { NodeDefinition } from '@sim4d/types';

type CurveOnSurfaceParams = Record<string, never>;

interface CurveOnSurfaceInputs {
  surface: unknown;
  uvPoints: unknown;
}

interface CurveOnSurfaceOutputs {
  curve: unknown;
}

export const SurfaceCurveOpsCurveOnSurfaceNode: NodeDefinition<
  CurveOnSurfaceInputs,
  CurveOnSurfaceOutputs,
  CurveOnSurfaceParams
> = {
  id: 'Surface::CurveOnSurface',
  type: 'Surface::CurveOnSurface',
  category: 'Surface',
  label: 'CurveOnSurface',
  description: 'Create curve on surface',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    uvPoints: {
      type: 'Point2D[]',
      label: 'Uv Points',
      required: true,
    },
  },
  outputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'curveOnSurface',
      params: {
        surface: inputs.surface,
        uvPoints: inputs.uvPoints,
      },
    });

    return {
      curve: result,
    };
  },
};
