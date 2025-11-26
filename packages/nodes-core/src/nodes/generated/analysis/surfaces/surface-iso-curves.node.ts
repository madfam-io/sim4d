import type { NodeDefinition } from '@sim4d/types';

interface SurfaceIsoCurvesParams {
  uCount: number;
  vCount: number;
  direction: string;
}

interface SurfaceIsoCurvesInputs {
  surface: unknown;
}

interface SurfaceIsoCurvesOutputs {
  uCurves: unknown;
  vCurves: unknown;
  allCurves: unknown;
}

export const AnalysisSurfacesSurfaceIsoCurvesNode: NodeDefinition<
  SurfaceIsoCurvesInputs,
  SurfaceIsoCurvesOutputs,
  SurfaceIsoCurvesParams
> = {
  id: 'Analysis::SurfaceIsoCurves',
  category: 'Analysis',
  label: 'SurfaceIsoCurves',
  description: 'Extract surface isocurves',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    uCurves: {
      type: 'Wire[]',
      label: 'U Curves',
    },
    vCurves: {
      type: 'Wire[]',
      label: 'V Curves',
    },
    allCurves: {
      type: 'Wire[]',
      label: 'All Curves',
    },
  },
  params: {
    uCount: {
      type: 'number',
      label: 'U Count',
      default: 10,
      min: 2,
      max: 50,
    },
    vCount: {
      type: 'number',
      label: 'V Count',
      default: 10,
      min: 2,
      max: 50,
    },
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'both',
      options: ['both', 'u-only', 'v-only'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceIsocurves',
      params: {
        surface: inputs.surface,
        uCount: params.uCount,
        vCount: params.vCount,
        direction: params.direction,
      },
    });

    return {
      uCurves: results.uCurves,
      vCurves: results.vCurves,
      allCurves: results.allCurves,
    };
  },
};
