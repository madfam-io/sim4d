import type { NodeDefinition } from '@sim4d/types';

interface OffsetParams {
  distance: number;
  side: string;
}

interface OffsetInputs {
  curve: unknown;
}

interface OffsetOutputs {
  offset: unknown;
}

export const SketchCurvesOffsetNode: NodeDefinition<OffsetInputs, OffsetOutputs, OffsetParams> = {
  id: 'Sketch::Offset',
  type: 'Sketch::Offset',
  category: 'Sketch',
  label: 'Offset',
  description: 'Offset a curve',
  inputs: {
    curve: {
      type: 'Wire',
      label: 'Curve',
      required: true,
    },
  },
  outputs: {
    offset: {
      type: 'Wire',
      label: 'Offset',
    },
  },
  params: {
    distance: {
      type: 'number',
      label: 'Distance',
      default: 10,
      min: -10000,
      max: 10000,
    },
    side: {
      type: 'enum',
      label: 'Side',
      default: 'right',
      options: ['left', 'right', 'both'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'offsetCurve',
      params: {
        curve: inputs.curve,
        distance: params.distance,
        side: params.side,
      },
    });

    return {
      offset: result,
    };
  },
};
