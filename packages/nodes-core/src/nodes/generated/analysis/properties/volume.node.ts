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
  volume: number;
}

export const VolumeNode: NodeDefinition<VolumeInputs, VolumeOutputs, VolumeParams> = {
  type: 'Analysis::Volume',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'Volume',
    description: 'Calculate volume of a solid',
  },

  params: {},

  inputs: {
    solid: 'Solid',
  },

  outputs: {
    volume: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureVolume',
      params: {
        solid: inputs.solid,
      },
    });

    return {
      volume: result,
    };
  },
};
