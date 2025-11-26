import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  minThickness: number;
  maxThickness: number;
}
interface Inputs {
  solid: Solid;
}
interface Outputs {
  thinAreas: Face[];
  thickAreas: Face[];
  averageThickness: number;
}

export const WallThicknessNode: NodeDefinition<
  WallThicknessInputs,
  WallThicknessOutputs,
  WallThicknessParams
> = {
  type: 'Analysis::WallThickness',
  category: 'Analysis',
  subcategory: 'Geometry',

  metadata: {
    label: 'WallThickness',
    description: 'Analyze wall thickness',
  },

  params: {
    minThickness: NumberParam({
      default: 1,
      min: 0.01,
      max: 1000,
    }),
    maxThickness: NumberParam({
      default: 10,
      min: 0.01,
      max: 1000,
    }),
  },

  inputs: {
    solid: 'Solid',
  },

  outputs: {
    thinAreas: 'Face[]',
    thickAreas: 'Face[]',
    averageThickness: 'number',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'analyzeWallThickness',
      params: {
        solid: inputs.solid,
        minThickness: params.minThickness,
        maxThickness: params.maxThickness,
      },
    });

    return {
      thinAreas: result,
      thickAreas: result,
      averageThickness: result,
    };
  },
};
