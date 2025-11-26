import type { NodeDefinition } from '@sim4d/types';

interface SurfaceFlatnessParams {
  tolerance: number;
  showBestFitPlane: boolean;
}

interface SurfaceFlatnessInputs {
  surface: unknown;
}

interface SurfaceFlatnessOutputs {
  isFlat: unknown;
  flatness: unknown;
  bestFitPlane: unknown;
  maxDeviation: unknown;
}

export const AnalysisSurfacesSurfaceFlatnessNode: NodeDefinition<
  SurfaceFlatnessInputs,
  SurfaceFlatnessOutputs,
  SurfaceFlatnessParams
> = {
  id: 'Analysis::SurfaceFlatness',
  category: 'Analysis',
  label: 'SurfaceFlatness',
  description: 'Analyze surface flatness',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    isFlat: {
      type: 'boolean',
      label: 'Is Flat',
    },
    flatness: {
      type: 'number',
      label: 'Flatness',
    },
    bestFitPlane: {
      type: 'Face',
      label: 'Best Fit Plane',
    },
    maxDeviation: {
      type: 'number',
      label: 'Max Deviation',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
    showBestFitPlane: {
      type: 'boolean',
      label: 'Show Best Fit Plane',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceFlatness',
      params: {
        surface: inputs.surface,
        tolerance: params.tolerance,
        showBestFitPlane: params.showBestFitPlane,
      },
    });

    return {
      isFlat: results.isFlat,
      flatness: results.flatness,
      bestFitPlane: results.bestFitPlane,
      maxDeviation: results.maxDeviation,
    };
  },
};
