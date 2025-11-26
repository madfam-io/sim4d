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
  line: Wire;
}
interface Outputs {
  distance: number;
  closestPoint: Point;
}

export const DistancePointToLineNode: NodeDefinition<
  DistancePointToLineInputs,
  DistancePointToLineOutputs,
  DistancePointToLineParams
> = {
  type: 'Analysis::DistancePointToLine',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'DistancePointToLine',
    description: 'Measure distance from point to line',
  },

  params: {},

  inputs: {
    point: 'Point',
    line: 'Wire',
  },

  outputs: {
    distance: 'number',
    closestPoint: 'Point',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureDistancePointLine',
      params: {
        point: inputs.point,
        line: inputs.line,
      },
    });

    return {
      distance: result,
      closestPoint: result,
    };
  },
};
