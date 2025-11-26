import type { NodeDefinition } from '@sim4d/types';

interface AlphaShapeParams {
  alpha: number;
}

interface AlphaShapeInputs {
  points: Array<[number, number, number]>;
}

interface AlphaShapeOutputs {
  shape: unknown;
  mesh: unknown;
}

export const PatternsDelaunayAlphaShapeNode: NodeDefinition<
  AlphaShapeInputs,
  AlphaShapeOutputs,
  AlphaShapeParams
> = {
  id: 'Patterns::AlphaShape',
  category: 'Patterns',
  label: 'AlphaShape',
  description: 'Alpha shape from points',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Wire',
      label: 'Shape',
    },
    mesh: {
      type: 'Mesh',
      label: 'Mesh',
    },
  },
  params: {
    alpha: {
      type: 'number',
      label: 'Alpha',
      default: 1,
      min: 0,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'alphaShape',
      params: {
        points: inputs.points,
        alpha: params.alpha,
      },
    });

    return {
      shape: results.shape,
      mesh: results.mesh,
    };
  },
};
