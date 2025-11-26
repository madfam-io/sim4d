import type { NodeDefinition } from '@sim4d/types';

interface ConstrainedDelaunayParams {
  refinement: boolean;
  maxArea: number;
}

interface ConstrainedDelaunayInputs {
  points: Array<[number, number, number]>;
  boundary: unknown;
  holes?: unknown;
}

interface ConstrainedDelaunayOutputs {
  triangulation: unknown;
}

export const PatternsDelaunayConstrainedDelaunayNode: NodeDefinition<
  ConstrainedDelaunayInputs,
  ConstrainedDelaunayOutputs,
  ConstrainedDelaunayParams
> = {
  id: 'Patterns::ConstrainedDelaunay',
  type: 'Patterns::ConstrainedDelaunay',
  category: 'Patterns',
  label: 'ConstrainedDelaunay',
  description: 'Constrained Delaunay triangulation',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
    holes: {
      type: 'Wire[]',
      label: 'Holes',
      optional: true,
    },
  },
  outputs: {
    triangulation: {
      type: 'Mesh',
      label: 'Triangulation',
    },
  },
  params: {
    refinement: {
      type: 'boolean',
      label: 'Refinement',
      default: true,
    },
    maxArea: {
      type: 'number',
      label: 'Max Area',
      default: 100,
      min: 0.1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'delaunayConstrained',
      params: {
        points: inputs.points,
        boundary: inputs.boundary,
        holes: inputs.holes,
        refinement: params.refinement,
        maxArea: params.maxArea,
      },
    });

    return {
      triangulation: result,
    };
  },
};
