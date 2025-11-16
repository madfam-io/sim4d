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
  solid: Solid;
}
interface Outputs {
  Ixx: number;
  Iyy: number;
  Izz: number;
  principalAxes: Vector[];
}

export const MomentOfInertiaNode: NodeDefinition<
  MomentOfInertiaInputs,
  MomentOfInertiaOutputs,
  MomentOfInertiaParams
> = {
  type: 'Analysis::MomentOfInertia',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'MomentOfInertia',
    description: 'Calculate moment of inertia',
  },

  params: {},

  inputs: {
    solid: 'Solid',
  },

  outputs: {
    Ixx: 'number',
    Iyy: 'number',
    Izz: 'number',
    principalAxes: 'Vector[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'calculateMomentOfInertia',
      params: {
        solid: inputs.solid,
      },
    });

    return {
      Ixx: result,
      Iyy: result,
      Izz: result,
      principalAxes: result,
    };
  },
};
