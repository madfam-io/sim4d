import type { NodeDefinition } from '@brepflow/types';

interface ShadowAnalysisParams {
  lightType: string;
  intensity: number;
}

interface ShadowAnalysisInputs {
  lightSource: [number, number, number];
  lightDirection?: [number, number, number];
  objects: unknown;
  groundPlane: unknown;
}

interface ShadowAnalysisOutputs {
  shadowRegions: unknown;
  lightRays: unknown;
  illuminatedAreas: unknown;
}

export const AnalysisProximityShadowAnalysisNode: NodeDefinition<
  ShadowAnalysisInputs,
  ShadowAnalysisOutputs,
  ShadowAnalysisParams
> = {
  id: 'Analysis::ShadowAnalysis',
  category: 'Analysis',
  label: 'ShadowAnalysis',
  description: 'Calculate shadow patterns',
  inputs: {
    lightSource: {
      type: 'Point',
      label: 'Light Source',
      required: true,
    },
    lightDirection: {
      type: 'Vector',
      label: 'Light Direction',
      optional: true,
    },
    objects: {
      type: 'Shape[]',
      label: 'Objects',
      required: true,
    },
    groundPlane: {
      type: 'Face',
      label: 'Ground Plane',
      required: true,
    },
  },
  outputs: {
    shadowRegions: {
      type: 'Face[]',
      label: 'Shadow Regions',
    },
    lightRays: {
      type: 'Wire[]',
      label: 'Light Rays',
    },
    illuminatedAreas: {
      type: 'Face[]',
      label: 'Illuminated Areas',
    },
  },
  params: {
    lightType: {
      type: 'enum',
      label: 'Light Type',
      default: 'directional',
      options: ['directional', 'point', 'spot'],
    },
    intensity: {
      type: 'number',
      label: 'Intensity',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'shadowAnalysis',
      params: {
        lightSource: inputs.lightSource,
        lightDirection: inputs.lightDirection,
        objects: inputs.objects,
        groundPlane: inputs.groundPlane,
        lightType: params.lightType,
        intensity: params.intensity,
      },
    });

    return {
      shadowRegions: results.shadowRegions,
      lightRays: results.lightRays,
      illuminatedAreas: results.illuminatedAreas,
    };
  },
};
