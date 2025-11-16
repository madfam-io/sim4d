import { NodeDefinition } from '@brepflow/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  parameter: number;
}
interface Inputs {
  curve: Wire;
}
interface Outputs {
  curvature: number;
  radius: number;
  center: Point;
  normal: Vector;
}

export const CurvatureNode: NodeDefinition<CurvatureInputs, CurvatureOutputs, CurvatureParams> = {
  type: 'Analysis::Curvature',
  category: 'Analysis',
  subcategory: 'Geometry',

  metadata: {
    label: 'Curvature',
    description: 'Analyze curvature at a point',
  },

  params: {
    parameter: NumberParam({
      default: 0.5,
      min: 0,
      max: 1,
    }),
  },

  inputs: {
    curve: 'Wire',
  },

  outputs: {
    curvature: 'number',
    radius: 'number',
    center: 'Point',
    normal: 'Vector',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'analyzeCurvature',
      params: {
        curve: inputs.curve,
        parameter: params.parameter,
      },
    });

    return {
      curvature: result,
      radius: result,
      center: result,
      normal: result,
    };
  },
};
