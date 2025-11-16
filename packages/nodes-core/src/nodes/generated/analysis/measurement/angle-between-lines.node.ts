import { NodeDefinition } from '@brepflow/types';
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
  line1: Wire;
  line2: Wire;
}
interface Outputs {
  angle: number;
}

export const AngleBetweenLinesNode: NodeDefinition<
  AngleBetweenLinesInputs,
  AngleBetweenLinesOutputs,
  AngleBetweenLinesParams
> = {
  type: 'Analysis::AngleBetweenLines',
  category: 'Analysis',
  subcategory: 'Measurement',

  metadata: {
    label: 'AngleBetweenLines',
    description: 'Measure angle between two lines',
  },

  params: {
    unit: EnumParam({
      default: 'degrees',
      options: ['degrees', 'radians'],
    }),
  },

  inputs: {
    line1: 'Wire',
    line2: 'Wire',
  },

  outputs: {
    angle: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureAngleLines',
      params: {
        line1: inputs.line1,
        line2: inputs.line2,
        unit: params.unit,
      },
    });

    return {
      angle: result,
    };
  },
};
