import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  totalRise: number;
  clearance: number;
}
interface Inputs {
  startPoint: Point;
}
interface Outputs {
  staircase: Shape;
}

export const UShapedStairNode: NodeDefinition<Inputs, Outputs, Params> = {
  type: 'Architecture::UShaped Stair',
  category: 'Architecture',
  subcategory: 'Stairs',

  metadata: {
    label: 'UShaped Stair',
    description: 'U-shaped staircase',
  },

  params: {
    totalRise: NumberParam({
      default: 3000,
      min: 1000,
      max: 6000,
    }),
    clearance: NumberParam({
      default: 100,
      min: 50,
      max: 300,
    }),
  },

  inputs: {
    startPoint: 'Point',
  },

  outputs: {
    staircase: 'Shape',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'uShapedStair',
      params: {
        startPoint: inputs.startPoint,
        totalRise: params.totalRise,
        clearance: params.clearance,
      },
    });

    return {
      staircase: result,
    };
  },
};
