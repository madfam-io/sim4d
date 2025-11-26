import type { NodeDefinition } from '@sim4d/types';

interface CollisionDetectionParams {
  toolLength: number;
  holderDiameter: number;
}

interface CollisionDetectionInputs {
  toolpath: unknown;
  model: unknown;
}

interface CollisionDetectionOutputs {
  collisions: Array<[number, number, number]>;
  safePath: unknown;
}

export const FabricationCNCCollisionDetectionNode: NodeDefinition<
  CollisionDetectionInputs,
  CollisionDetectionOutputs,
  CollisionDetectionParams
> = {
  id: 'Fabrication::CollisionDetection',
  type: 'Fabrication::CollisionDetection',
  category: 'Fabrication',
  label: 'CollisionDetection',
  description: 'Tool collision checking',
  inputs: {
    toolpath: {
      type: 'Wire[]',
      label: 'Toolpath',
      required: true,
    },
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    collisions: {
      type: 'Point[]',
      label: 'Collisions',
    },
    safePath: {
      type: 'Wire[]',
      label: 'Safe Path',
    },
  },
  params: {
    toolLength: {
      type: 'number',
      label: 'Tool Length',
      default: 50,
      min: 10,
      max: 200,
    },
    holderDiameter: {
      type: 'number',
      label: 'Holder Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'collisionDetection',
      params: {
        toolpath: inputs.toolpath,
        model: inputs.model,
        toolLength: params.toolLength,
        holderDiameter: params.holderDiameter,
      },
    });

    return {
      collisions: results.collisions,
      safePath: results.safePath,
    };
  },
};
