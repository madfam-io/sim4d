import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  u: number;
  v: number;
}
interface Inputs {
  surface: Face;
}
interface Outputs {
  gaussianCurvature: number;
  meanCurvature: number;
  minCurvature: number;
  maxCurvature: number;
}

export const SurfaceCurvatureNode: NodeDefinition<
  SurfaceCurvatureInputs,
  SurfaceCurvatureOutputs,
  SurfaceCurvatureParams
> = {
  type: 'Analysis::SurfaceCurvature',
  category: 'Analysis',
  subcategory: 'Geometry',

  metadata: {
    label: 'SurfaceCurvature',
    description: 'Analyze surface curvature',
  },

  params: {
    u: NumberParam({
      default: 0.5,
      min: 0,
      max: 1,
    }),
    v: NumberParam({
      default: 0.5,
      min: 0,
      max: 1,
    }),
  },

  inputs: {
    surface: 'Face',
  },

  outputs: {
    gaussianCurvature: 'number',
    meanCurvature: 'number',
    minCurvature: 'number',
    maxCurvature: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'analyzeSurfaceCurvature',
      params: {
        surface: inputs.surface,
        u: params.u,
        v: params.v,
      },
    });

    return {
      gaussianCurvature: result,
      meanCurvature: result,
      minCurvature: result,
      maxCurvature: result,
    };
  },
};
