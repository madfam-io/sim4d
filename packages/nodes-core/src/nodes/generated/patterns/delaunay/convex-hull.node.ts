import type { NodeDefinition } from '@brepflow/types';

type ConvexHullParams = Record<string, never>;

interface ConvexHullInputs {
  points: Array<[number, number, number]>;
}

interface ConvexHullOutputs {
  hull: unknown;
  vertices: Array<[number, number, number]>;
}

export const PatternsDelaunayConvexHullNode: NodeDefinition<
  ConvexHullInputs,
  ConvexHullOutputs,
  ConvexHullParams
> = {
  id: 'Patterns::ConvexHull',
  category: 'Patterns',
  label: 'ConvexHull',
  description: 'Convex hull of points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    hull: {
      type: 'Wire',
      label: 'Hull',
    },
    vertices: {
      type: 'Point[]',
      label: 'Vertices',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'convexHull',
      params: {
        points: inputs.points,
      },
    });

    return {
      hull: results.hull,
      vertices: results.vertices,
    };
  },
};
