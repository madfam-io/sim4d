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
  curve: Wire;
}
interface Outputs {
  length: number;
}

export const CurveLengthNode: NodeDefinition<
  CurveLengthInputs,
  CurveLengthOutputs,
  CurveLengthParams
> = {
  type: 'Analysis::CurveLength',
  category: 'Analysis',
  subcategory: 'Properties',

  metadata: {
    label: 'CurveLength',
    description: 'Measure the length of a curve',
  },

  params: {},

  inputs: {
    curve: 'Wire',
  },

  outputs: {
    length: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'measureCurveLength',
      params: {
        curve: inputs.curve,
      },
    });

    return {
      length: result,
    };
  },
};
