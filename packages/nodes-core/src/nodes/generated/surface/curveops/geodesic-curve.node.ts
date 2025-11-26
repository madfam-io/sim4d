import { NodeDefinition } from '@sim4d/types';

type Params = {};
interface Inputs {
  surface: Face;
  startPoint: Point;
  endPoint: Point;
}
interface Outputs {
  geodesic: Wire;
}

export const GeodesicCurveNode: NodeDefinition<
  GeodesicCurveInputs,
  GeodesicCurveOutputs,
  GeodesicCurveParams
> = {
  type: 'Surface::GeodesicCurve',
  category: 'Surface',
  subcategory: 'CurveOps',

  metadata: {
    label: 'GeodesicCurve',
    description: 'Create geodesic curve',
  },

  params: {},

  inputs: {
    surface: 'Face',
    startPoint: 'Point',
    endPoint: 'Point',
  },

  outputs: {
    geodesic: 'Wire',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'geodesicCurve',
      params: {
        surface: inputs.surface,
        startPoint: inputs.startPoint,
        endPoint: inputs.endPoint,
      },
    });

    return {
      geodesic: result,
    };
  },
};
