import type { NodeDefinition } from '@sim4d/types';

interface SurfaceParametrizationParams {
  showGrid: boolean;
  gridDensity: number;
}

interface SurfaceParametrizationInputs {
  surface: unknown;
}

interface SurfaceParametrizationOutputs {
  uRange: unknown;
  vRange: unknown;
  parameterGrid: unknown;
}

export const AnalysisSurfacesSurfaceParametrizationNode: NodeDefinition<
  SurfaceParametrizationInputs,
  SurfaceParametrizationOutputs,
  SurfaceParametrizationParams
> = {
  id: 'Analysis::SurfaceParametrization',
  type: 'Analysis::SurfaceParametrization',
  category: 'Analysis',
  label: 'SurfaceParametrization',
  description: 'Analyze surface parametrization',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    uRange: {
      type: 'number[]',
      label: 'U Range',
    },
    vRange: {
      type: 'number[]',
      label: 'V Range',
    },
    parameterGrid: {
      type: 'Wire[]',
      label: 'Parameter Grid',
    },
  },
  params: {
    showGrid: {
      type: 'boolean',
      label: 'Show Grid',
      default: true,
    },
    gridDensity: {
      type: 'number',
      label: 'Grid Density',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceParametrization',
      params: {
        surface: inputs.surface,
        showGrid: params.showGrid,
        gridDensity: params.gridDensity,
      },
    });

    return {
      uRange: results.uRange,
      vRange: results.vRange,
      parameterGrid: results.parameterGrid,
    };
  },
};
