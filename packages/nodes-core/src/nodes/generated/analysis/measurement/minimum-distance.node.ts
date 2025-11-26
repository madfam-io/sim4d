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
  shape1: Shape;
  shape2: Shape;
}
interface Outputs {
  distance: number;
  point1: Point;
  point2: Point;
}

export const MinimumDistanceNode: NodeDefinition<
  MinimumDistanceInputs,
  MinimumDistanceOutputs,
  MinimumDistanceParams
> = {
  type: 'Analysis::MinimumDistance',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'MinimumDistance',
    description: 'Find minimum distance between two shapes',
  },

  params: {},

  inputs: {
    shape1: 'Shape',
    shape2: 'Shape',
  },

  outputs: {
    distance: 'number',
    point1: 'Point',
    point2: 'Point',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureMinimumDistance',
      params: {
        shape1: inputs.shape1,
        shape2: inputs.shape2,
      },
    });

    return {
      distance: result,
      point1: result,
      point2: result,
    };
  },
};
