import { NodeDefinition } from '@brepflow/types';

interface Params {
  tolerance: number;
  extend: boolean;
}
interface Inputs {
  curve1: Wire;
  curve2: Wire;
}
interface Outputs {
  intersectionPoints: Point[];
}

export const IntersectCurvesNode: NodeDefinition<
  IntersectCurvesInputs,
  IntersectCurvesOutputs,
  IntersectCurvesParams
> = {
  type: 'Surface::IntersectCurves',
  category: 'Surface',
  subcategory: 'CurveOps',

  metadata: {
    label: 'IntersectCurves',
    description: 'Find curve intersections',
  },

  params: {
    tolerance: {
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    extend: {
      default: false,
    },
  },

  inputs: {
    curve1: 'Wire',
    curve2: 'Wire',
  },

  outputs: {
    intersectionPoints: 'Point[]',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'intersectCurves',
      params: {
        curve1: inputs.curve1,
        curve2: inputs.curve2,
        tolerance: params.tolerance,
        extend: params.extend,
      },
    });

    return {
      intersectionPoints: result,
    };
  },
};
