import type { NodeDefinition } from '@sim4d/types';

interface BezierSurfaceParams {
  uDegree: number;
  vDegree: number;
}

interface BezierSurfaceInputs {
  controlPoints: unknown;
}

interface BezierSurfaceOutputs {
  surface: unknown;
}

export const SolidSurfaceBezierSurfaceNode: NodeDefinition<
  BezierSurfaceInputs,
  BezierSurfaceOutputs,
  BezierSurfaceParams
> = {
  id: 'Solid::BezierSurface',
  type: 'Solid::BezierSurface',
  category: 'Solid',
  label: 'BezierSurface',
  description: 'Create a Bezier surface from control points',
  inputs: {
    controlPoints: {
      type: 'Point[][]',
      label: 'Control Points',
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
    uDegree: {
      type: 'number',
      label: 'U Degree',
      default: 3,
      min: 1,
      max: 10,
    },
    vDegree: {
      type: 'number',
      label: 'V Degree',
      default: 3,
      min: 1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeBezierSurface',
      params: {
        controlPoints: inputs.controlPoints,
        uDegree: params.uDegree,
        vDegree: params.vDegree,
      },
    });

    return {
      surface: result,
    };
  },
};
