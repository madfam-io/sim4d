import type { NodeDefinition } from '@sim4d/types';

interface SpringParams {
  radius: number;
  pitch: number;
  height: number;
  wireRadius: number;
  leftHanded: boolean;
}

type SpringInputs = Record<string, never>;

interface SpringOutputs {
  spring: unknown;
}

export const SolidHelicalSpringNode: NodeDefinition<SpringInputs, SpringOutputs, SpringParams> = {
  id: 'Solid::Spring',
  type: 'Solid::Spring',
  category: 'Solid',
  label: 'Spring',
  description: 'Create a spring solid',
  inputs: {},
  outputs: {
    spring: {
      type: 'Solid',
      label: 'Spring',
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
    wireRadius: {
      type: 'number',
      label: 'Wire Radius',
      default: 5,
      min: 0.1,
      max: 100,
    },
    leftHanded: {
      type: 'boolean',
      label: 'Left Handed',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeSpring',
      params: {
        radius: params.radius,
        pitch: params.pitch,
        height: params.height,
        wireRadius: params.wireRadius,
        leftHanded: params.leftHanded,
      },
    });

    return {
      spring: result,
    };
  },
};
