import type { NodeDefinition } from '@sim4d/types';

interface CollisionDetectionParams {
  detectionType: string;
  tolerance: number;
  includeSelfCollision: boolean;
}

interface CollisionDetectionInputs {
  bodies: unknown;
}

interface CollisionDetectionOutputs {
  collisionPairs: unknown;
}

export const SimulationKinematicsCollisionDetectionNode: NodeDefinition<
  CollisionDetectionInputs,
  CollisionDetectionOutputs,
  CollisionDetectionParams
> = {
  id: 'Simulation::CollisionDetection',
  type: 'Simulation::CollisionDetection',
  category: 'Simulation',
  label: 'CollisionDetection',
  description: 'Setup collision detection',
  inputs: {
    bodies: {
      type: 'Shape[]',
      label: 'Bodies',
      required: true,
    },
  },
  outputs: {
    collisionPairs: {
      type: 'Data',
      label: 'Collision Pairs',
    },
  },
  params: {
    detectionType: {
      type: 'enum',
      label: 'Detection Type',
      default: 'discrete',
      options: ['discrete', 'continuous'],
    },
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.1,
      min: 0.001,
      max: 10,
    },
    includeSelfCollision: {
      type: 'boolean',
      label: 'Include Self Collision',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'collisionDetection',
      params: {
        bodies: inputs.bodies,
        detectionType: params.detectionType,
        tolerance: params.tolerance,
        includeSelfCollision: params.includeSelfCollision,
      },
    });

    return {
      collisionPairs: result,
    };
  },
};
