import type { NodeDefinition } from '@brepflow/types';

interface StarParams {
  points: number;
  outerRadius: number;
  innerRadius: number;
}

interface StarInputs {
  center?: [number, number, number];
}

interface StarOutputs {
  star: unknown;
}

export const SketchPatternsStarNode: NodeDefinition<StarInputs, StarOutputs, StarParams> = {
  id: 'Sketch::Star',
  category: 'Sketch',
  label: 'Star',
  description: 'Create a star shape',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    star: {
      type: 'Wire',
      label: 'Star',
    },
  },
  params: {
    points: {
      type: 'number',
      label: 'Points',
      default: 5,
      min: 3,
      max: 100,
      step: 1,
    },
    outerRadius: {
      type: 'number',
      label: 'Outer Radius',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    innerRadius: {
      type: 'number',
      label: 'Inner Radius',
      default: 40,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeStar',
      params: {
        center: inputs.center,
        points: params.points,
        outerRadius: params.outerRadius,
        innerRadius: params.innerRadius,
      },
    });

    return {
      star: result,
    };
  },
};
