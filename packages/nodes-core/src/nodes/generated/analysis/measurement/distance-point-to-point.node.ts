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
  point1: Point;
  point2: Point;
}
interface Outputs {
  distance: number;
  vector: Vector;
}

export const DistancePointToPointNode: NodeDefinition<
  DistancePointToPointInputs,
  DistancePointToPointOutputs,
  DistancePointToPointParams
> = {
  type: 'Analysis::DistancePointToPoint',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'DistancePointToPoint',
    description: 'Measure distance between two points',
  },

  params: {},

  inputs: {
    point1: 'Point',
    point2: 'Point',
  },

  outputs: {
    distance: 'number',
    vector: 'Vector',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureDistancePointPoint',
      params: {
        point1: inputs.point1,
        point2: inputs.point2,
      },
    });

    return {
      distance: result,
      vector: result,
    };
  },
};
