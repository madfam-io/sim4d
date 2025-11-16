import type { NodeDefinition } from '@brepflow/types';

interface BSplineSurfaceParams {
  uDegree: number;
  vDegree: number;
  uPeriodic: boolean;
  vPeriodic: boolean;
}

interface BSplineSurfaceInputs {
  controlPoints: unknown;
  uKnots?: unknown;
  vKnots?: unknown;
}

interface BSplineSurfaceOutputs {
  surface: unknown;
}

export const SolidSurfaceBSplineSurfaceNode: NodeDefinition<
  BSplineSurfaceInputs,
  BSplineSurfaceOutputs,
  BSplineSurfaceParams
> = {
  id: 'Solid::BSplineSurface',
  type: 'Solid::BSplineSurface',
  category: 'Solid',
  label: 'BSplineSurface',
  description: 'Create a B-Spline surface',
  inputs: {
    controlPoints: {
      type: 'Point[][]',
      label: 'Control Points',
      required: true,
    },
    uKnots: {
      type: 'number[]',
      label: 'U Knots',
      optional: true,
    },
    vKnots: {
      type: 'number[]',
      label: 'V Knots',
      optional: true,
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
    uPeriodic: {
      type: 'boolean',
      label: 'U Periodic',
      default: false,
    },
    vPeriodic: {
      type: 'boolean',
      label: 'V Periodic',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeBSplineSurface',
      params: {
        controlPoints: inputs.controlPoints,
        uKnots: inputs.uKnots,
        vKnots: inputs.vKnots,
        uDegree: params.uDegree,
        vDegree: params.vDegree,
        uPeriodic: params.uPeriodic,
        vPeriodic: params.vPeriodic,
      },
    });

    return {
      surface: result,
    };
  },
};
