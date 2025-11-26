import type { NodeDefinition } from '@sim4d/types';

interface CurveConvexHullParams {
  samples: number;
}

interface CurveConvexHullInputs {
  curve: unknown;
}

interface CurveConvexHullOutputs {
  convexHull: unknown;
  hullPoints: Array<[number, number, number]>;
}

export const AnalysisCurvesCurveConvexHullNode: NodeDefinition<
  CurveConvexHullInputs,
  CurveConvexHullOutputs,
  CurveConvexHullParams
> = {
  id: 'Analysis::CurveConvexHull',
  type: 'Analysis::CurveConvexHull',
  category: 'Analysis',
  label: 'CurveConvexHull',
  description: 'Generate convex hull of curve points',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    convexHull: {
      type: 'Wire',
      label: 'Convex Hull',
    },
    hullPoints: {
      type: 'Point[]',
      label: 'Hull Points',
    },
  },
  params: {
    samples: {
      type: 'number',
      label: 'Samples',
      default: 100,
      min: 20,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveConvexHull',
      params: {
        curve: inputs.curve,
        samples: params.samples,
      },
    });

    return {
      convexHull: results.convexHull,
      hullPoints: results.hullPoints,
    };
  },
};
