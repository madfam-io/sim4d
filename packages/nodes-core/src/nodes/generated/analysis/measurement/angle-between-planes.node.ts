import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  unit: string;
}
interface Inputs {
  plane1: Face;
  plane2: Face;
}
interface Outputs {
  angle: number;
}

export const AngleBetweenPlanesNode: NodeDefinition<
  AngleBetweenPlanesInputs,
  AngleBetweenPlanesOutputs,
  AngleBetweenPlanesParams
> = {
  type: 'Analysis::AngleBetweenPlanes',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'AngleBetweenPlanes',
    description: 'Measure angle between two planes',
  },

  params: {
    unit: EnumParam({
      default: 'degrees',
      options: ['degrees', 'radians'],
    }),
  },

  inputs: {
    plane1: 'Face',
    plane2: 'Face',
  },

  outputs: {
    angle: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureAnglePlanes',
      params: {
        plane1: inputs.plane1,
        plane2: inputs.plane2,
        unit: params.unit,
      },
    });

    return {
      angle: result,
    };
  },
};
