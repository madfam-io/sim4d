import type { NodeDefinition } from '@sim4d/types';

interface RayIntersectionParams {
  tolerance: number;
  maxDistance: number;
}

interface RayIntersectionInputs {
  rayOrigin: [number, number, number];
  rayDirection: [number, number, number];
  targets: unknown;
}

interface RayIntersectionOutputs {
  hitPoints: Array<[number, number, number]>;
  hitDistances: unknown;
  hitNormals: Array<[number, number, number]>;
}

export const AnalysisIntersectionRayIntersectionNode: NodeDefinition<
  RayIntersectionInputs,
  RayIntersectionOutputs,
  RayIntersectionParams
> = {
  id: 'Analysis::RayIntersection',
  type: 'Analysis::RayIntersection',
  category: 'Analysis',
  label: 'RayIntersection',
  description: 'Cast ray and find intersections',
  inputs: {
    rayOrigin: {
      type: 'Point',
      label: 'Ray Origin',
      required: true,
    },
    rayDirection: {
      type: 'Vector',
      label: 'Ray Direction',
      required: true,
    },
    targets: {
      type: 'Shape[]',
      label: 'Targets',
      required: true,
    },
  },
  outputs: {
    hitPoints: {
      type: 'Point[]',
      label: 'Hit Points',
    },
    hitDistances: {
      type: 'number[]',
      label: 'Hit Distances',
    },
    hitNormals: {
      type: 'Vector[]',
      label: 'Hit Normals',
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
    maxDistance: {
      type: 'number',
      label: 'Max Distance',
      default: 1000,
      min: 1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rayIntersection',
      params: {
        rayOrigin: inputs.rayOrigin,
        rayDirection: inputs.rayDirection,
        targets: inputs.targets,
        tolerance: params.tolerance,
        maxDistance: params.maxDistance,
      },
    });

    return {
      hitPoints: results.hitPoints,
      hitDistances: results.hitDistances,
      hitNormals: results.hitNormals,
    };
  },
};
