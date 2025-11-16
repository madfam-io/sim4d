import type { NodeDefinition } from '@brepflow/types';

interface CurveClosestPointParams {
  tolerance: number;
  showConnection: boolean;
}

interface CurveClosestPointInputs {
  curve: unknown;
  point: [number, number, number];
}

interface CurveClosestPointOutputs {
  closestPoint: [number, number, number];
  distance: unknown;
  parameter: unknown;
  connectionLine: unknown;
}

export const AnalysisCurvesCurveClosestPointNode: NodeDefinition<
  CurveClosestPointInputs,
  CurveClosestPointOutputs,
  CurveClosestPointParams
> = {
  id: 'Analysis::CurveClosestPoint',
  category: 'Analysis',
  label: 'CurveClosestPoint',
  description: 'Find closest point on curve to reference',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
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
    parameter: {
      type: 'number',
      label: 'Parameter',
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
      type: 'curveClosestPoint',
      params: {
        curve: inputs.curve,
        point: inputs.point,
        tolerance: params.tolerance,
        showConnection: params.showConnection,
      },
    });

    return {
      closestPoint: results.closestPoint,
      distance: results.distance,
      parameter: results.parameter,
      connectionLine: results.connectionLine,
    };
  },
};
