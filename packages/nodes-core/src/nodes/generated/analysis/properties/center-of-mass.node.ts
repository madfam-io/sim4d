import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  density: number;
}
interface Inputs {
  shape: Shape;
}
interface Outputs {
  center: Point;
  mass: number;
}

export const CenterOfMassNode: NodeDefinition<
  CenterOfMassInputs,
  CenterOfMassOutputs,
  CenterOfMassParams
> = {
  type: 'Analysis::CenterOfMass',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'CenterOfMass',
    description: 'Find center of mass/gravity',
  },

  params: {
    density: NumberParam({
      default: 1,
      min: 0.001,
      max: 100000,
    }),
  },

  inputs: {
    shape: 'Shape',
  },

  outputs: {
    center: 'Point',
    mass: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateCenterOfMass',
      params: {
        shape: inputs.shape,
        density: params.density,
      },
    });

    return {
      center: result,
      mass: result,
    };
  },
};
