import { NodeDefinition } from '@sim4d/types';

type Params = {};
interface Inputs {
  surface: Face;
  uvPoints: Point2D[];
}
interface Outputs {
  curve: Wire;
}

export const CurveOnSurfaceNode: NodeDefinition<
  CurveOnSurfaceInputs,
  CurveOnSurfaceOutputs,
  CurveOnSurfaceParams
> = {
  type: 'Surface::CurveOnSurface',
  category: 'Surface',
  subcategory: 'CurveOps',

  metadata: {
    label: 'CurveOnSurface',
    description: 'Create curve on surface',
  },

  params: {},

  inputs: {
    surface: 'Face',
    uvPoints: 'Point2D[]',
  },

  outputs: {
    curve: 'Wire',
  },

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
