import type { NodeDefinition } from '@sim4d/types';

interface CurveEndpointsParams {
  tangentLength: number;
  showTangents: boolean;
}

interface CurveEndpointsInputs {
  curve: unknown;
}

interface CurveEndpointsOutputs {
  startPoint: [number, number, number];
  endPoint: [number, number, number];
  startTangent: [number, number, number];
  endTangent: [number, number, number];
}

export const AnalysisCurvesCurveEndpointsNode: NodeDefinition<
  CurveEndpointsInputs,
  CurveEndpointsOutputs,
  CurveEndpointsParams
> = {
  id: 'Analysis::CurveEndpoints',
  category: 'Analysis',
  label: 'CurveEndpoints',
  description: 'Extract curve endpoints and tangents',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    startPoint: {
      type: 'Point',
      label: 'Start Point',
    },
    endPoint: {
      type: 'Point',
      label: 'End Point',
    },
    startTangent: {
      type: 'Vector',
      label: 'Start Tangent',
    },
    endTangent: {
      type: 'Vector',
      label: 'End Tangent',
    },
  },
  params: {
    tangentLength: {
      type: 'number',
      label: 'Tangent Length',
      default: 10,
      min: 1,
      max: 100,
    },
    showTangents: {
      type: 'boolean',
      label: 'Show Tangents',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveEndpoints',
      params: {
        curve: inputs.curve,
        tangentLength: params.tangentLength,
        showTangents: params.showTangents,
      },
    });

    return {
      startPoint: results.startPoint,
      endPoint: results.endPoint,
      startTangent: results.startTangent,
      endTangent: results.endTangent,
    };
  },
};
