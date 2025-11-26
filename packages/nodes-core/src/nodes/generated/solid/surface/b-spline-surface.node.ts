import { NodeDefinition } from '@sim4d/types';

interface Params {
  uDegree: number;
  vDegree: number;
  uPeriodic: boolean;
  vPeriodic: boolean;
}
interface Inputs {
  controlPoints: Point[][];
  uKnots?: number[];
  vKnots?: number[];
}
interface Outputs {
  surface: Face;
}

export const BSplineSurfaceNode: NodeDefinition<
  BSplineSurfaceInputs,
  BSplineSurfaceOutputs,
  BSplineSurfaceParams
> = {
  type: 'Solid::BSplineSurface',
  category: 'Solid',
  subcategory: 'Surface',

  metadata: {
    label: 'BSplineSurface',
    description: 'Create a B-Spline surface',
  },

  params: {
    uDegree: {
      default: 3,
      min: 1,
      max: 10,
    },
    vDegree: {
      default: 3,
      min: 1,
      max: 10,
    },
    uPeriodic: {
      default: false,
    },
    vPeriodic: {
      default: false,
    },
  },

  inputs: {
    controlPoints: 'Point[][]',
    uKnots: 'number[]',
    vKnots: 'number[]',
  },

  outputs: {
    surface: 'Face',
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
