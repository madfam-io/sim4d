import type { NodeDefinition } from '@sim4d/types';

interface BarnsleyFernParams {
  points: number;
  variation: string;
}

interface BarnsleyFernInputs {
  plane?: unknown;
}

interface BarnsleyFernOutputs {
  fern: Array<[number, number, number]>;
}

export const PatternsFractalsBarnsleyFernNode: NodeDefinition<
  BarnsleyFernInputs,
  BarnsleyFernOutputs,
  BarnsleyFernParams
> = {
  id: 'Patterns::BarnsleyFern',
  category: 'Patterns',
  label: 'BarnsleyFern',
  description: 'Barnsley fern fractal',
  inputs: {
    plane: {
      type: 'Plane',
      label: 'Plane',
      optional: true,
    },
  },
  outputs: {
    fern: {
      type: 'Point[]',
      label: 'Fern',
    },
  },
  params: {
    points: {
      type: 'number',
      label: 'Points',
      default: 10000,
      min: 100,
      max: 100000,
      step: 100,
    },
    variation: {
      type: 'enum',
      label: 'Variation',
      default: 'classic',
      options: ['classic', 'thelypteridaceae', 'leptosporangiate'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'barnsleyFern',
      params: {
        plane: inputs.plane,
        points: params.points,
        variation: params.variation,
      },
    });

    return {
      fern: result,
    };
  },
};
