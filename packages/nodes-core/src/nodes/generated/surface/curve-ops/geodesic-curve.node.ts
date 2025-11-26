import type { NodeDefinition } from '@sim4d/types';

type GeodesicCurveParams = Record<string, never>;

interface GeodesicCurveInputs {
  surface: unknown;
  startPoint: [number, number, number];
  endPoint: [number, number, number];
}

interface GeodesicCurveOutputs {
  geodesic: unknown;
}

export const SurfaceCurveOpsGeodesicCurveNode: NodeDefinition<
  GeodesicCurveInputs,
  GeodesicCurveOutputs,
  GeodesicCurveParams
> = {
  id: 'Surface::GeodesicCurve',
  category: 'Surface',
  label: 'GeodesicCurve',
  description: 'Create geodesic curve',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    startPoint: {
      type: 'Point',
      label: 'Start Point',
      required: true,
    },
    endPoint: {
      type: 'Point',
      label: 'End Point',
      required: true,
    },
  },
  outputs: {
    geodesic: {
      type: 'Wire',
      label: 'Geodesic',
    },
  },
  params: {},
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
