import type { NodeDefinition } from '@brepflow/types';

interface IslamicStarParams {
  points: number;
  innerRadius: number;
  rotation: number;
}

interface IslamicStarInputs {
  center: [number, number, number];
}

interface IslamicStarOutputs {
  pattern: unknown;
}

export const PatternsIslamicIslamicStarNode: NodeDefinition<
  IslamicStarInputs,
  IslamicStarOutputs,
  IslamicStarParams
> = {
  id: 'Patterns::IslamicStar',
  category: 'Patterns',
  label: 'IslamicStar',
  description: 'Islamic star pattern',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire',
      label: 'Pattern',
    },
  },
  params: {
    points: {
      type: 'number',
      label: 'Points',
      default: 8,
      min: 3,
      max: 24,
      step: 1,
    },
    innerRadius: {
      type: 'number',
      label: 'Inner Radius',
      default: 0.5,
      min: 0.1,
      max: 0.9,
    },
    rotation: {
      type: 'number',
      label: 'Rotation',
      default: 0,
      min: -180,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'islamicStar',
      params: {
        center: inputs.center,
        points: params.points,
        innerRadius: params.innerRadius,
        rotation: params.rotation,
      },
    });

    return {
      pattern: result,
    };
  },
};
