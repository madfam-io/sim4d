import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

type Params = {};
interface Inputs {
  point: Point;
  plane: Face;
}
interface Outputs {
  distance: number;
  projectedPoint: Point;
}

export const DistancePointToPlaneNode: NodeDefinition<
  DistancePointToPlaneInputs,
  DistancePointToPlaneOutputs,
  DistancePointToPlaneParams
> = {
  type: 'Analysis::DistancePointToPlane',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'DistancePointToPlane',
    description: 'Measure distance from point to plane',
  },

  params: {},

  inputs: {
    point: 'Point',
    plane: 'Face',
  },

  outputs: {
    distance: 'number',
    projectedPoint: 'Point',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureDistancePointPlane',
      params: {
        point: inputs.point,
        plane: inputs.plane,
      },
    });

    return {
      distance: result,
      projectedPoint: result,
    };
  },
};
