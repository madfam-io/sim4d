import type { NodeDefinition } from '@sim4d/types';

interface HelicalSweepParams {
  pitch: number;
  height: number;
  turns: number;
  radius: number;
  leftHanded: boolean;
  taper: number;
}

interface HelicalSweepInputs {
  profile: unknown;
  axis?: unknown;
}

interface HelicalSweepOutputs {
  shape: unknown;
}

export const AdvancedSweepHelicalSweepNode: NodeDefinition<
  HelicalSweepInputs,
  HelicalSweepOutputs,
  HelicalSweepParams
> = {
  id: 'Advanced::HelicalSweep',
  type: 'Advanced::HelicalSweep',
  category: 'Advanced',
  label: 'HelicalSweep',
  description: 'Sweep profile along helix',
  inputs: {
    profile: {
      type: 'Wire',
      label: 'Profile',
      required: true,
    },
    axis: {
      type: 'Axis',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
    },
  },
  params: {
    pitch: {
      type: 'number',
      label: 'Pitch',
      default: 10,
      min: 0.1,
      max: 1000,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    turns: {
      type: 'number',
      label: 'Turns',
      default: 5,
      min: 0.1,
      max: 1000,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 20,
      min: 0.1,
      max: 10000,
    },
    leftHanded: {
      type: 'boolean',
      label: 'Left Handed',
      default: false,
    },
    taper: {
      type: 'number',
      label: 'Taper',
      default: 0,
      min: -45,
      max: 45,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'helicalSweep',
      params: {
        profile: inputs.profile,
        axis: inputs.axis,
        pitch: params.pitch,
        height: params.height,
        turns: params.turns,
        radius: params.radius,
        leftHanded: params.leftHanded,
        taper: params.taper,
      },
    });

    return {
      shape: result,
    };
  },
};
