import { NodeDefinition } from '@brepflow/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  minClearance: number;
}
interface Inputs {
  shape1: Shape;
  shape2: Shape;
}
interface Outputs {
  hasClearance: boolean;
  actualClearance: number;
  violationPoints: Point[];
}

export const ClearanceNode: NodeDefinition<ClearanceInputs, ClearanceOutputs, ClearanceParams> = {
  type: 'Analysis::Clearance',
  category: 'Analysis',
  subcategory: 'Collision',

  metadata: {
    label: 'Clearance',
    description: 'Check clearance between shapes',
  },

  params: {
    minClearance: NumberParam({
      default: 1,
      min: 0,
      max: 10000,
    }),
  },

  inputs: {
    shape1: 'Shape',
    shape2: 'Shape',
  },

  outputs: {
    hasClearance: 'boolean',
    actualClearance: 'number',
    violationPoints: 'Point[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'checkClearance',
      params: {
        shape1: inputs.shape1,
        shape2: inputs.shape2,
        minClearance: params.minClearance,
      },
    });

    return {
      hasClearance: result,
      actualClearance: result,
      violationPoints: result,
    };
  },
};
