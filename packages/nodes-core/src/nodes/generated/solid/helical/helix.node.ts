import type { NodeDefinition } from '@sim4d/types';

interface HelixParams {
  radius: number;
  pitch: number;
  height: number;
  leftHanded: boolean;
}

type HelixInputs = Record<string, never>;

interface HelixOutputs {
  helix: unknown;
}

export const SolidHelicalHelixNode: NodeDefinition<HelixInputs, HelixOutputs, HelixParams> = {
  id: 'Solid::Helix',
  category: 'Solid',
  label: 'Helix',
  description: 'Create a helical curve',
  inputs: {},
  outputs: {
    helix: {
      type: 'Wire',
      label: 'Helix',
    },
  },
  params: {
    radius: {
      type: 'number',
      label: 'Radius',
      default: 50,
      min: 0.1,
      max: 10000,
    },
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 20,
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
    leftHanded: {
      type: 'boolean',
      label: 'Left Handed',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeHelix',
      params: {
        radius: params.radius,
        pitch: params.pitch,
        height: params.height,
        leftHanded: params.leftHanded,
      },
    });

    return {
      helix: result,
    };
  },
};
