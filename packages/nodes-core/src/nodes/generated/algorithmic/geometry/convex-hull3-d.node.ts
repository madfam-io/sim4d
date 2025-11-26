import type { NodeDefinition } from '@sim4d/types';

interface ConvexHull3DParams {
  tolerance: number;
  includeInterior: boolean;
}

interface ConvexHull3DInputs {
  points: Array<[number, number, number]>;
}

interface ConvexHull3DOutputs {
  hull: unknown;
  vertices: Array<[number, number, number]>;
  faces: unknown;
  volume: unknown;
}

export const AlgorithmicGeometryConvexHull3DNode: NodeDefinition<
  ConvexHull3DInputs,
  ConvexHull3DOutputs,
  ConvexHull3DParams
> = {
  id: 'Algorithmic::ConvexHull3D',
  category: 'Algorithmic',
  label: 'ConvexHull3D',
  description: 'Compute 3D convex hull',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    hull: {
      type: 'Shape',
      label: 'Hull',
    },
    vertices: {
      type: 'Point[]',
      label: 'Vertices',
    },
    faces: {
      type: 'Face[]',
      label: 'Faces',
    },
    volume: {
      type: 'number',
      label: 'Volume',
    },
  },
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.01,
      min: 0.001,
      max: 1,
    },
    includeInterior: {
      type: 'boolean',
      label: 'Include Interior',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'convexHull3D',
      params: {
        points: inputs.points,
        tolerance: params.tolerance,
        includeInterior: params.includeInterior,
      },
    });

    return {
      hull: results.hull,
      vertices: results.vertices,
      faces: results.faces,
      volume: results.volume,
    };
  },
};
