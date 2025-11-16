import type { NodeDefinition } from '@brepflow/types';

interface PhyllotaxisPatternParams {
  count: number;
  angle: number;
  c: number;
}

interface PhyllotaxisPatternInputs {
  center: [number, number, number];
}

interface PhyllotaxisPatternOutputs {
  points: Array<[number, number, number]>;
  spiral: unknown;
}

export const PatternsAlgorithmicPhyllotaxisPatternNode: NodeDefinition<
  PhyllotaxisPatternInputs,
  PhyllotaxisPatternOutputs,
  PhyllotaxisPatternParams
> = {
  id: 'Patterns::PhyllotaxisPattern',
  type: 'Patterns::PhyllotaxisPattern',
  category: 'Patterns',
  label: 'PhyllotaxisPattern',
  description: 'Phyllotaxis spiral pattern',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
    },
    spiral: {
      type: 'Wire',
      label: 'Spiral',
    },
  },
  params: {
    count: {
      type: 'number',
      label: 'Count',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 137.5,
      min: 0,
      max: 360,
    },
    c: {
      type: 'number',
      label: 'C',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'phyllotaxisPattern',
      params: {
        center: inputs.center,
        count: params.count,
        angle: params.angle,
        c: params.c,
      },
    });

    return {
      points: results.points,
      spiral: results.spiral,
    };
  },
};
