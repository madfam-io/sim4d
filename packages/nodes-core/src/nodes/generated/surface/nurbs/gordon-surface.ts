import type { NodeDefinition } from '@sim4d/types';

type GordonSurfaceParams = Record<string, never>;

interface GordonSurfaceInputs {
  uCurves: unknown;
  vCurves: unknown;
  points?: unknown;
}

interface GordonSurfaceOutputs {
  surface: unknown;
}

export const SurfaceNURBSGordonSurfaceNode: NodeDefinition<
  GordonSurfaceInputs,
  GordonSurfaceOutputs,
  GordonSurfaceParams
> = {
  id: 'Surface::GordonSurface',
  type: 'Surface::GordonSurface',
  category: 'Surface',
  label: 'GordonSurface',
  description: 'Create Gordon surface',
  inputs: {
    uCurves: {
      type: 'Wire[]',
      label: 'U Curves',
      required: true,
    },
    vCurves: {
      type: 'Wire[]',
      label: 'V Curves',
      required: true,
    },
    points: {
      type: 'Point[][]',
      label: 'Points',
      optional: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'gordonSurface',
      params: {
        uCurves: inputs.uCurves,
        vCurves: inputs.vCurves,
        points: inputs.points,
      },
    });

    return {
      surface: result,
    };
  },
};
