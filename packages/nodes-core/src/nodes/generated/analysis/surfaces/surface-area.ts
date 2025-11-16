import type { NodeDefinition } from '@brepflow/types';

interface SurfaceAreaParams {
  precision: number;
  showCentroid: boolean;
}

interface SurfaceAreaInputs {
  surface: unknown;
}

interface SurfaceAreaOutputs {
  area: unknown;
  centroid: [number, number, number];
  boundaryLength: unknown;
}

export const AnalysisSurfacesSurfaceAreaNode: NodeDefinition<
  SurfaceAreaInputs,
  SurfaceAreaOutputs,
  SurfaceAreaParams
> = {
  id: 'Analysis::SurfaceArea',
  type: 'Analysis::SurfaceArea',
  category: 'Analysis',
  label: 'SurfaceArea',
  description: 'Calculate surface area and properties',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    area: {
      type: 'number',
      label: 'Area',
    },
    centroid: {
      type: 'Point',
      label: 'Centroid',
    },
    boundaryLength: {
      type: 'number',
      label: 'Boundary Length',
    },
  },
  params: {
    precision: {
      type: 'number',
      label: 'Precision',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    showCentroid: {
      type: 'boolean',
      label: 'Show Centroid',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'surfaceArea',
      params: {
        surface: inputs.surface,
        precision: params.precision,
        showCentroid: params.showCentroid,
      },
    });

    return {
      area: results.area,
      centroid: results.centroid,
      boundaryLength: results.boundaryLength,
    };
  },
};
