import type { NodeDefinition } from '@brepflow/types';

interface SpiralPatternParams {
  spiralType: string;
  turns: number;
  growth: number;
}

interface SpiralPatternInputs {
  center: [number, number, number];
}

interface SpiralPatternOutputs {
  spiral: unknown;
}

export const PatternsGeometricSpiralPatternNode: NodeDefinition<
  SpiralPatternInputs,
  SpiralPatternOutputs,
  SpiralPatternParams
> = {
  id: 'Patterns::SpiralPattern',
  category: 'Patterns',
  label: 'SpiralPattern',
  description: 'Spiral-based pattern',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    spiral: {
      type: 'Wire',
      label: 'Spiral',
    },
  },
  params: {
    spiralType: {
      type: 'enum',
      label: 'Spiral Type',
      default: 'logarithmic',
      options: ['archimedean', 'logarithmic', 'fermat', 'golden'],
    },
    turns: {
      type: 'number',
      label: 'Turns',
      default: 5,
      min: 0.5,
      max: 20,
    },
    growth: {
      type: 'number',
      label: 'Growth',
      default: 1.2,
      min: 1,
      max: 3,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'spiralPattern',
      params: {
        center: inputs.center,
        spiralType: params.spiralType,
        turns: params.turns,
        growth: params.growth,
      },
    });

    return {
      spiral: result,
    };
  },
};
