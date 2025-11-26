import type { NodeDefinition } from '@sim4d/types';

interface SurfaceClosestPointParams {
  tolerance: number;
  showConnection: boolean;
}

interface SurfaceClosestPointInputs {
  surface: unknown;
  point: [number, number, number];
}

interface SurfaceClosestPointOutputs {
  closestPoint: [number, number, number];
  distance: unknown;
  uParameter: unknown;
  vParameter: unknown;
}

export const AnalysisSurfacesSurfaceClosestPointNode: NodeDefinition<
  SurfaceClosestPointInputs,
  SurfaceClosestPointOutputs,
  SurfaceClosestPointParams
> = {
  id: 'Analysis::SurfaceClosestPoint',
  category: 'Analysis',
  label: 'SurfaceClosestPoint',
  description: 'Find closest point on surface',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
    point: {
      type: 'Point',
      label: 'Point',
      required: true,
    },
  },
  outputs: {
    closestPoint: {
      type: 'Point',
      label: 'Closest Point',
    },
    distance: {
      type: 'number',
      label: 'Distance',
    },
    uParameter: {
      type: 'number',
      label: 'U Parameter',
    },
    vParameter: {
      type: 'number',
      label: 'V Parameter',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    showConnection: {
      type: 'boolean',
      label: 'Show Connection',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceClosestPoint',
      params: {
        surface: inputs.surface,
        point: inputs.point,
        tolerance: params.tolerance,
        showConnection: params.showConnection,
      },
    });

    return {
      closestPoint: results.closestPoint,
      distance: results.distance,
      uParameter: results.uParameter,
      vParameter: results.vParameter,
    };
  },
};
