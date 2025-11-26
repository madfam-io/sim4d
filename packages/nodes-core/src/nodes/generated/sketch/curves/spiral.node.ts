import type { NodeDefinition } from '@sim4d/types';

interface SpiralParams {
  startRadius: number;
  endRadius: number;
  turns: number;
  type: string;
}

interface SpiralInputs {
  center?: [number, number, number];
}

interface SpiralOutputs {
  spiral: unknown;
}

export const SketchCurvesSpiralNode: NodeDefinition<SpiralInputs, SpiralOutputs, SpiralParams> = {
  id: 'Sketch::Spiral',
  category: 'Sketch',
  label: 'Spiral',
  description: 'Create a 2D spiral',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    spiral: {
      type: 'Wire',
      label: 'Spiral',
    },
  },
  params: {
    startRadius: {
      type: 'number',
      label: 'Start Radius',
      default: 10,
      min: 0,
      max: 10000,
    },
    endRadius: {
      type: 'number',
      label: 'End Radius',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    turns: {
      type: 'number',
      label: 'Turns',
      default: 3,
      min: 0.1,
      max: 100,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'archimedean',
      options: ['archimedean', 'logarithmic'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeSpiral2D',
      params: {
        center: inputs.center,
        startRadius: params.startRadius,
        endRadius: params.endRadius,
        turns: params.turns,
        type: params.type,
      },
    });

    return {
      spiral: result,
    };
  },
};
