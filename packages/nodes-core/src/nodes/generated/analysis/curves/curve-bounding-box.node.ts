import type { NodeDefinition } from '@brepflow/types';

interface CurveBoundingBoxParams {
  orientation: string;
  showBox: boolean;
}

interface CurveBoundingBoxInputs {
  curve: unknown;
}

interface CurveBoundingBoxOutputs {
  boundingBox: unknown;
  minPoint: [number, number, number];
  maxPoint: [number, number, number];
  dimensions: [number, number, number];
}

export const AnalysisCurvesCurveBoundingBoxNode: NodeDefinition<
  CurveBoundingBoxInputs,
  CurveBoundingBoxOutputs,
  CurveBoundingBoxParams
> = {
  id: 'Analysis::CurveBoundingBox',
  category: 'Analysis',
  label: 'CurveBoundingBox',
  description: 'Calculate oriented bounding box',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    boundingBox: {
      type: 'Shape',
      label: 'Bounding Box',
    },
    minPoint: {
      type: 'Point',
      label: 'Min Point',
    },
    maxPoint: {
      type: 'Point',
      label: 'Max Point',
    },
    dimensions: {
      type: 'Vector',
      label: 'Dimensions',
    },
  },
  params: {
    orientation: {
      type: 'enum',
      label: 'Orientation',
      default: 'axis-aligned',
      options: ['axis-aligned', 'minimal'],
    },
    showBox: {
      type: 'boolean',
      label: 'Show Box',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveBoundingBox',
      params: {
        curve: inputs.curve,
        orientation: params.orientation,
        showBox: params.showBox,
      },
    });

    return {
      boundingBox: results.boundingBox,
      minPoint: results.minPoint,
      maxPoint: results.maxPoint,
      dimensions: results.dimensions,
    };
  },
};
