import type { NodeDefinition } from '@sim4d/types';

interface CurveLengthParams {
  tolerance: number;
  segments: number;
}

interface CurveLengthInputs {
  curve: unknown;
}

interface CurveLengthOutputs {
  length: unknown;
  segmentLengths: unknown;
  arcLength: unknown;
}

export const AnalysisCurvesCurveLengthNode: NodeDefinition<
  CurveLengthInputs,
  CurveLengthOutputs,
  CurveLengthParams
> = {
  id: 'Analysis::CurveLength',
  type: 'Analysis::CurveLength',
  category: 'Analysis',
  label: 'CurveLength',
  description: 'Calculate curve length and properties',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    length: {
      type: 'number',
      label: 'Length',
    },
    segmentLengths: {
      type: 'number[]',
      label: 'Segment Lengths',
    },
    arcLength: {
      type: 'Wire',
      label: 'Arc Length',
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
    segments: {
      type: 'number',
      label: 'Segments',
      default: 100,
      min: 10,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'curveLength',
      params: {
        curve: inputs.curve,
        tolerance: params.tolerance,
        segments: params.segments,
      },
    });

    return {
      length: results.length,
      segmentLengths: results.segmentLengths,
      arcLength: results.arcLength,
    };
  },
};
