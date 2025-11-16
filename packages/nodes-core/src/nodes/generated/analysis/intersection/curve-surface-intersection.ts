import type { NodeDefinition } from '@brepflow/types';

interface CurveSurfaceIntersectionParams {
  tolerance: number;
  extendCurve: boolean;
}

interface CurveSurfaceIntersectionInputs {
  curve: unknown;
  surface: unknown;
}

interface CurveSurfaceIntersectionOutputs {
  intersectionPoints: Array<[number, number, number]>;
  curveParameters: unknown;
  surfaceParameters: Array<[number, number, number]>;
}

export const AnalysisIntersectionCurveSurfaceIntersectionNode: NodeDefinition<
  CurveSurfaceIntersectionInputs,
  CurveSurfaceIntersectionOutputs,
  CurveSurfaceIntersectionParams
> = {
  id: 'Analysis::CurveSurfaceIntersection',
  type: 'Analysis::CurveSurfaceIntersection',
  category: 'Analysis',
  label: 'CurveSurfaceIntersection',
  description: 'Find curve-surface intersections',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    intersectionPoints: {
      type: 'Point[]',
      label: 'Intersection Points',
    },
    curveParameters: {
      type: 'number[]',
      label: 'Curve Parameters',
    },
    surfaceParameters: {
      type: 'Point[]',
      label: 'Surface Parameters',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    extendCurve: {
      type: 'boolean',
      label: 'Extend Curve',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveSurfaceIntersection',
      params: {
        curve: inputs.curve,
        surface: inputs.surface,
        tolerance: params.tolerance,
        extendCurve: params.extendCurve,
      },
    });

    return {
      intersectionPoints: results.intersectionPoints,
      curveParameters: results.curveParameters,
      surfaceParameters: results.surfaceParameters,
    };
  },
};
