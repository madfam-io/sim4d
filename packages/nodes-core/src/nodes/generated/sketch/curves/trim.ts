import type { NodeDefinition } from '@sim4d/types';

interface TrimParams {
  startParameter: number;
  endParameter: number;
}

interface TrimInputs {
  curve: unknown;
}

interface TrimOutputs {
  trimmed: unknown;
}

export const SketchCurvesTrimNode: NodeDefinition<TrimInputs, TrimOutputs, TrimParams> = {
  id: 'Sketch::Trim',
  type: 'Sketch::Trim',
  category: 'Sketch',
  label: 'Trim',
  description: 'Trim a curve',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    trimmed: {
      type: 'Wire',
      label: 'Trimmed',
    },
  },
  params: {
    startParameter: {
      type: 'number',
      label: 'Start Parameter',
      default: 0,
      min: 0,
      max: 1,
    },
    endParameter: {
      type: 'number',
      label: 'End Parameter',
      default: 1,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'trimCurve',
      params: {
        curve: inputs.curve,
        startParameter: params.startParameter,
        endParameter: params.endParameter,
      },
    });

    return {
      trimmed: result,
    };
  },
};
