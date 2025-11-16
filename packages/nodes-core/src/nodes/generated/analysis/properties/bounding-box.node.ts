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
  shape: Shape;
}
interface Outputs {
  min: Point;
  max: Point;
  center: Point;
  dimensions: Vector;
}

export const BoundingBoxNode: NodeDefinition<
  BoundingBoxInputs,
  BoundingBoxOutputs,
  BoundingBoxParams
> = {
  type: 'Analysis::BoundingBox',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'BoundingBox',
    description: 'Get bounding box of shape',
  },

  params: {},

  inputs: {
    shape: 'Shape',
  },

  outputs: {
    min: 'Point',
    max: 'Point',
    center: 'Point',
    dimensions: 'Vector',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'getBoundingBox',
      params: {
        shape: inputs.shape,
      },
    });

    return {
      min: result,
      max: result,
      center: result,
      dimensions: result,
    };
  },
};
