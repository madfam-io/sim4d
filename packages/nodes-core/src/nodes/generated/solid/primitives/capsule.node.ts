import type { NodeDefinition } from '@brepflow/types';

interface CapsuleParams {
  radius: number;
  height: number;
}

type CapsuleInputs = Record<string, never>;

interface CapsuleOutputs {
  solid: unknown;
}

export const SolidPrimitivesCapsuleNode: NodeDefinition<
  CapsuleInputs,
  CapsuleOutputs,
  CapsuleParams
> = {
  id: 'Solid::Capsule',
  category: 'Solid',
  label: 'Capsule',
  description: 'Create a capsule (cylinder with hemisphere caps)',
  inputs: {},
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 25,
      min: 0.1,
      max: 10000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeCapsule',
      params: {
        radius: params.radius,
        height: params.height,
      },
    });

    return {
      solid: result,
    };
  },
};
