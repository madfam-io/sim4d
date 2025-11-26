import type { NodeDefinition } from '@sim4d/types';

interface AlphaShapeParams {
  alpha: number;
  mode: string;
}

interface AlphaShapeInputs {
  points: Array<[number, number, number]>;
}

interface AlphaShapeOutputs {
  shape: unknown;
  boundary: unknown;
  simplices: unknown;
}

export const AlgorithmicGeometryAlphaShapeNode: NodeDefinition<
  AlphaShapeInputs,
  AlphaShapeOutputs,
  AlphaShapeParams
> = {
  id: 'Algorithmic::AlphaShape',
  type: 'Algorithmic::AlphaShape',
  category: 'Algorithmic',
  label: 'AlphaShape',
  description: 'Generate alpha shape from point cloud',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
    boundary: {
      type: 'Wire[]',
      label: 'Boundary',
    },
    simplices: {
      type: 'Properties[]',
      label: 'Simplices',
    },
  },
  params: {
    alpha: {
      type: 'number',
      label: 'Alpha',
      default: 1,
      min: 0.1,
      max: 100,
    },
    mode: {
      type: 'enum',
      label: 'Mode',
      default: '3D',
      options: ['3D', '2D'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'alphaShape',
      params: {
        points: inputs.points,
        alpha: params.alpha,
        mode: params.mode,
      },
    });

    return {
      shape: results.shape,
      boundary: results.boundary,
      simplices: results.simplices,
    };
  },
};
