import { NodeDefinition } from '@brepflow/types';
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
  intersects: boolean;
  intersection: Shape;
}

export const IntersectionNode: NodeDefinition<
  IntersectionInputs,
  IntersectionOutputs,
  IntersectionParams
> = {
  type: 'Analysis::Intersection',
  category: 'Analysis',
  subcategory: 'Collision',

  metadata: {
    label: 'Intersection',
    description: 'Check for intersection between shapes',
  },

  params: {},

  inputs: {
    shape1: 'Shape',
    shape2: 'Shape',
  },

  outputs: {
    intersects: 'boolean',
    intersection: 'Shape',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'checkIntersection',
      params: {
        shape1: inputs.shape1,
        shape2: inputs.shape2,
      },
    });

    return {
      intersects: result,
      intersection: result,
    };
  },
};
