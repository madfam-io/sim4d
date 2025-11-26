import type { NodeDefinition } from '@sim4d/types';

interface CurveAreaMomentsParams {
  precision: number;
  showCentroid: boolean;
}

interface CurveAreaMomentsInputs {
  curve: unknown;
}

interface CurveAreaMomentsOutputs {
  area: unknown;
  centroid: [number, number, number];
  momentX: unknown;
  momentY: unknown;
}

export const AnalysisCurvesCurveAreaMomentsNode: NodeDefinition<
  CurveAreaMomentsInputs,
  CurveAreaMomentsOutputs,
  CurveAreaMomentsParams
> = {
  id: 'Analysis::CurveAreaMoments',
  category: 'Analysis',
  label: 'CurveAreaMoments',
  description: 'Calculate area moments for closed curves',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
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
    momentX: {
      type: 'number',
      label: 'Moment X',
    },
    momentY: {
      type: 'number',
      label: 'Moment Y',
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
      type: 'curveAreaMoments',
      params: {
        curve: inputs.curve,
        precision: params.precision,
        showCentroid: params.showCentroid,
      },
    });

    return {
      area: results.area,
      centroid: results.centroid,
      momentX: results.momentX,
      momentY: results.momentY,
    };
  },
};
