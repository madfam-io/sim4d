import type { NodeDefinition } from '@sim4d/types';

interface MinimumDistanceParams {
  tolerance: number;
  showConnection: boolean;
}

interface MinimumDistanceInputs {
  geometry1: unknown;
  geometry2: unknown;
}

interface MinimumDistanceOutputs {
  distance: unknown;
  point1: [number, number, number];
  point2: [number, number, number];
  connectionLine: unknown;
}

export const AnalysisProximityMinimumDistanceNode: NodeDefinition<
  MinimumDistanceInputs,
  MinimumDistanceOutputs,
  MinimumDistanceParams
> = {
  id: 'Analysis::MinimumDistance',
  category: 'Analysis',
  label: 'MinimumDistance',
  description: 'Find minimum distance between geometries',
  inputs: {
    geometry1: {
      type: 'Shape',
      label: 'Geometry1',
      required: true,
    },
    geometry2: {
      type: 'Shape',
      label: 'Geometry2',
      required: true,
    },
  },
  outputs: {
    distance: {
      type: 'number',
      label: 'Distance',
    },
    point1: {
      type: 'Point',
      label: 'Point1',
    },
    point2: {
      type: 'Point',
      label: 'Point2',
    },
    connectionLine: {
      type: 'Wire',
      label: 'Connection Line',
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
      type: 'minimumDistance',
      params: {
        geometry1: inputs.geometry1,
        geometry2: inputs.geometry2,
        tolerance: params.tolerance,
        showConnection: params.showConnection,
      },
    });

    return {
      distance: results.distance,
      point1: results.point1,
      point2: results.point2,
      connectionLine: results.connectionLine,
    };
  },
};
