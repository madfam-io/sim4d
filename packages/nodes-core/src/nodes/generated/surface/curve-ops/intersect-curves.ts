import type { NodeDefinition } from '@brepflow/types';

interface IntersectCurvesParams {
  tolerance: number;
  extend: boolean;
}

interface IntersectCurvesInputs {
  curve1: unknown;
  curve2: unknown;
}

interface IntersectCurvesOutputs {
  intersectionPoints: Array<[number, number, number]>;
}

export const SurfaceCurveOpsIntersectCurvesNode: NodeDefinition<
  IntersectCurvesInputs,
  IntersectCurvesOutputs,
  IntersectCurvesParams
> = {
  id: 'Surface::IntersectCurves',
  type: 'Surface::IntersectCurves',
  category: 'Surface',
  label: 'IntersectCurves',
  description: 'Find curve intersections',
  inputs: {
    curve1: {
      type: 'Wire',
      label: 'Curve1',
      required: true,
    },
    curve2: {
      type: 'Wire',
      label: 'Curve2',
      required: true,
    },
  },
  outputs: {
    intersectionPoints: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.0001,
      max: 1,
    },
    extend: {
      type: 'boolean',
      label: 'Extend',
      default: false,
    },
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
