import type { NodeDefinition } from '@brepflow/types';

interface SurfaceFromPointsParams {
  degreeU: number;
  degreeV: number;
  smoothness: number;
}

interface SurfaceFromPointsInputs {
  points: Array<[number, number, number]>;
  uCount: unknown;
  vCount: unknown;
}

interface SurfaceFromPointsOutputs {
  surface: unknown;
}

export const SurfaceNURBSSurfaceFromPointsNode: NodeDefinition<
  SurfaceFromPointsInputs,
  SurfaceFromPointsOutputs,
  SurfaceFromPointsParams
> = {
  id: 'Surface::SurfaceFromPoints',
  type: 'Surface::SurfaceFromPoints',
  category: 'Surface',
  label: 'SurfaceFromPoints',
  description: 'Fit surface through points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    uCount: {
      type: 'number',
      label: 'U Count',
      required: true,
    },
    vCount: {
      type: 'number',
      label: 'V Count',
      required: true,
    },
  },
  outputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
    },
  },
  params: {
    degreeU: {
      type: 'number',
      label: 'Degree U',
      default: 3,
      min: 1,
      max: 10,
    },
    degreeV: {
      type: 'number',
      label: 'Degree V',
      default: 3,
      min: 1,
      max: 10,
    },
    smoothness: {
      type: 'number',
      label: 'Smoothness',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'surfaceFromPoints',
      params: {
        points: inputs.points,
        uCount: inputs.uCount,
        vCount: inputs.vCount,
        degreeU: params.degreeU,
        degreeV: params.degreeV,
        smoothness: params.smoothness,
      },
    });

    return {
      surface: result,
    };
  },
};
