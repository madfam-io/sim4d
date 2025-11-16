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
  area: number;
}

export const SurfaceAreaNode: NodeDefinition<
  SurfaceAreaInputs,
  SurfaceAreaOutputs,
  SurfaceAreaParams
> = {
  type: 'Analysis::SurfaceArea',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'SurfaceArea',
    description: 'Calculate surface area',
  },

  params: {},

  inputs: {
    shape: 'Shape',
  },

  outputs: {
    area: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureSurfaceArea',
      params: {
        shape: inputs.shape,
      },
    });

    return {
      area: result,
    };
  },
};
