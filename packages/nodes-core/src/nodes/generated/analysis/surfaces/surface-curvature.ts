import type { NodeDefinition } from '@sim4d/types';

interface SurfaceCurvatureParams {
  uSamples: number;
  vSamples: number;
  curvatureType: string;
  colorMap: boolean;
}

interface SurfaceCurvatureInputs {
  surface: unknown;
}

interface SurfaceCurvatureOutputs {
  curvatureMap: unknown;
  maxCurvature: unknown;
  minCurvature: unknown;
  averageCurvature: unknown;
}

export const AnalysisSurfacesSurfaceCurvatureNode: NodeDefinition<
  SurfaceCurvatureInputs,
  SurfaceCurvatureOutputs,
  SurfaceCurvatureParams
> = {
  id: 'Analysis::SurfaceCurvature',
  type: 'Analysis::SurfaceCurvature',
  category: 'Analysis',
  label: 'SurfaceCurvature',
  description: 'Analyze surface curvature (Gaussian and Mean)',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    curvatureMap: {
      type: 'Shape',
      label: 'Curvature Map',
    },
    maxCurvature: {
      type: 'number',
      label: 'Max Curvature',
    },
    minCurvature: {
      type: 'number',
      label: 'Min Curvature',
    },
    averageCurvature: {
      type: 'number',
      label: 'Average Curvature',
    },
  },
  params: {
    uSamples: {
      type: 'number',
      label: 'U Samples',
      default: 50,
      min: 10,
      max: 200,
    },
    vSamples: {
      type: 'number',
      label: 'V Samples',
      default: 50,
      min: 10,
      max: 200,
    },
    curvatureType: {
      type: 'enum',
      label: 'Curvature Type',
      default: 'gaussian',
      options: ['gaussian', 'mean', 'principal'],
    },
    colorMap: {
      type: 'boolean',
      label: 'Color Map',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceCurvature',
      params: {
        surface: inputs.surface,
        uSamples: params.uSamples,
        vSamples: params.vSamples,
        curvatureType: params.curvatureType,
        colorMap: params.colorMap,
      },
    });

    return {
      curvatureMap: results.curvatureMap,
      maxCurvature: results.maxCurvature,
      minCurvature: results.minCurvature,
      averageCurvature: results.averageCurvature,
    };
  },
};
