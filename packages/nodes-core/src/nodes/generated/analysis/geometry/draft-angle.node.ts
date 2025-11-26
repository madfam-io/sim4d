import { NodeDefinition } from '@sim4d/types';
import {
  NumberParam,
  BoolParam,
  StringParam,
  EnumParam,
  Vector3Param,
} from '../../../../utils/param-utils.js';

interface Params {
  pullDirection: [number, number, number];
  minAngle: number;
  maxAngle: number;
}
interface Inputs {
  solid: Solid;
}
interface Outputs {
  validFaces: Face[];
  invalidFaces: Face[];
  verticalFaces: Face[];
}

export const DraftAngleNode: NodeDefinition<DraftAngleInputs, DraftAngleOutputs, DraftAngleParams> =
  {
    type: 'Analysis::DraftAngle',
    category: 'Analysis',
    subcategory: 'Geometry',

    metadata: {
      label: 'DraftAngle',
      description: 'Analyze draft angles for molding',
    },

    params: {
      pullDirection: Vector3Param({
        default: [0, 0, 1],
      }),
      minAngle: NumberParam({
        default: 1,
        min: 0,
        max: 90,
      }),
      maxAngle: NumberParam({
        default: 10,
        min: 0,
        max: 90,
      }),
    },

    inputs: {
      solid: 'Solid',
    },

    outputs: {
      validFaces: 'Face[]',
      invalidFaces: 'Face[]',
      verticalFaces: 'Face[]',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
        type: 'analyzeDraftAngle',
        params: {
          solid: inputs.solid,
          pullDirection: params.pullDirection,
          minAngle: params.minAngle,
          maxAngle: params.maxAngle,
        },
      });

      return {
        validFaces: result,
        invalidFaces: result,
        verticalFaces: result,
      };
    },
  };
