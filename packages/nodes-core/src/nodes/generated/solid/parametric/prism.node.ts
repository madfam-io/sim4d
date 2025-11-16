import type { NodeDefinition } from '@brepflow/types';

interface PrismParams {
  height: number;
  twist: number;
  taper: number;
}

interface PrismInputs {
  profile: unknown;
}

interface PrismOutputs {
  solid: unknown;
}

export const SolidParametricPrismNode: NodeDefinition<PrismInputs, PrismOutputs, PrismParams> = {
  id: 'Solid::Prism',
  category: 'Solid',
  label: 'Prism',
  description: 'Create a prism from a profile and height',
  inputs: {
    profile: {
      type: 'Wire',
      label: 'Profile',
      required: true,
    },
  },
  outputs: {
    solid: {
      type: 'Solid',
      label: 'Solid',
    },
  },
  params: {
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    twist: {
      type: 'number',
      label: 'Twist',
      default: 0,
      min: -360,
      max: 360,
    },
    taper: {
      type: 'number',
      label: 'Taper',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makePrism',
      params: {
        profile: inputs.profile,
        height: params.height,
        twist: params.twist,
        taper: params.taper,
      },
    });

    return {
      solid: result,
    };
  },
};
