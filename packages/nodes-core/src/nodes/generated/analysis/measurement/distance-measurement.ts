import type { NodeDefinition } from '@sim4d/types';

interface DistanceMeasurementParams {
  precision: number;
  showDimension: boolean;
}

interface DistanceMeasurementInputs {
  point1: [number, number, number];
  point2: [number, number, number];
}

interface DistanceMeasurementOutputs {
  distance: unknown;
  dimensionLine: unknown;
  midpoint: [number, number, number];
}

export const AnalysisMeasurementDistanceMeasurementNode: NodeDefinition<
  DistanceMeasurementInputs,
  DistanceMeasurementOutputs,
  DistanceMeasurementParams
> = {
  id: 'Analysis::DistanceMeasurement',
  type: 'Analysis::DistanceMeasurement',
  category: 'Analysis',
  label: 'DistanceMeasurement',
  description: 'Measure distances with annotations',
  inputs: {
    point1: {
      type: 'Point',
      label: 'Point1',
      required: true,
    },
    point2: {
      type: 'Point',
      label: 'Point2',
      required: true,
    },
  },
  outputs: {
    distance: {
      type: 'number',
      label: 'Distance',
    },
    dimensionLine: {
      type: 'Wire',
      label: 'Dimension Line',
    },
    midpoint: {
      type: 'Point',
      label: 'Midpoint',
    },
  },
  params: {
    precision: {
      type: 'number',
      label: 'Precision',
      default: 2,
      min: 0,
      max: 6,
    },
    showDimension: {
      type: 'boolean',
      label: 'Show Dimension',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'distanceMeasurement',
      params: {
        point1: inputs.point1,
        point2: inputs.point2,
        precision: params.precision,
        showDimension: params.showDimension,
      },
    });

    return {
      distance: results.distance,
      dimensionLine: results.dimensionLine,
      midpoint: results.midpoint,
    };
  },
};
