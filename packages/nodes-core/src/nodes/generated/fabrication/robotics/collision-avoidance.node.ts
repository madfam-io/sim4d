import type { NodeDefinition } from '@sim4d/types';

interface CollisionAvoidanceParams {
  safetyMargin: number;
}

interface CollisionAvoidanceInputs {
  robotPath: unknown;
  environment: unknown;
}

interface CollisionAvoidanceOutputs {
  safePath: unknown;
  collisionPoints: Array<[number, number, number]>;
}

export const FabricationRoboticsCollisionAvoidanceNode: NodeDefinition<
  CollisionAvoidanceInputs,
  CollisionAvoidanceOutputs,
  CollisionAvoidanceParams
> = {
  id: 'Fabrication::CollisionAvoidance',
  category: 'Fabrication',
  label: 'CollisionAvoidance',
  description: 'Collision detection and avoidance',
  inputs: {
    robotPath: {
      type: 'Transform[]',
      label: 'Robot Path',
      required: true,
    },
    environment: {
      type: 'Shape[]',
      label: 'Environment',
      required: true,
    },
  },
  outputs: {
    safePath: {
      type: 'Transform[]',
      label: 'Safe Path',
    },
    collisionPoints: {
      type: 'Point[]',
      label: 'Collision Points',
    },
  },
  params: {
    safetyMargin: {
      type: 'number',
      label: 'Safety Margin',
      default: 10,
      min: 0,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'collisionAvoidance',
      params: {
        robotPath: inputs.robotPath,
        environment: inputs.environment,
        safetyMargin: params.safetyMargin,
      },
    });

    return {
      safePath: results.safePath,
      collisionPoints: results.collisionPoints,
    };
  },
};
