import type { NodeDefinition } from '@sim4d/types';

interface CollisionDetectionParams {
  tolerance: number;
  showCollisions: boolean;
}

interface CollisionDetectionInputs {
  objects: unknown;
}

interface CollisionDetectionOutputs {
  hasCollisions: unknown;
  collidingPairs: unknown;
  collisionRegions: unknown;
}

export const AnalysisProximityCollisionDetectionNode: NodeDefinition<
  CollisionDetectionInputs,
  CollisionDetectionOutputs,
  CollisionDetectionParams
> = {
  id: 'Analysis::CollisionDetection',
  type: 'Analysis::CollisionDetection',
  category: 'Analysis',
  label: 'CollisionDetection',
  description: 'Detect collisions between objects',
  inputs: {
    objects: {
      type: 'Shape[]',
      label: 'Objects',
      required: true,
    },
  },
  outputs: {
    hasCollisions: {
      type: 'boolean',
      label: 'Has Collisions',
    },
    collidingPairs: {
      type: 'Shape[][]',
      label: 'Colliding Pairs',
    },
    collisionRegions: {
      type: 'Shape[]',
      label: 'Collision Regions',
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
    showCollisions: {
      type: 'boolean',
      label: 'Show Collisions',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'collisionDetection',
      params: {
        objects: inputs.objects,
        tolerance: params.tolerance,
        showCollisions: params.showCollisions,
      },
    });

    return {
      hasCollisions: results.hasCollisions,
      collidingPairs: results.collidingPairs,
      collisionRegions: results.collisionRegions,
    };
  },
};
