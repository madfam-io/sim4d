import type { NodeDefinition } from '@sim4d/types';

interface HelicalGearParams {
  module: number;
  teeth: number;
  helixAngle: number;
  width: number;
  handedness: string;
}

interface HelicalGearInputs {
  center?: [number, number, number];
}

interface HelicalGearOutputs {
  gear: unknown;
  profile: unknown;
}

export const MechanicalEngineeringGearsHelicalGearNode: NodeDefinition<
  HelicalGearInputs,
  HelicalGearOutputs,
  HelicalGearParams
> = {
  id: 'MechanicalEngineering::HelicalGear',
  category: 'MechanicalEngineering',
  label: 'HelicalGear',
  description: 'Create helical gear with angle',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    gear: {
      type: 'Shape',
      label: 'Gear',
    },
    profile: {
      type: 'Wire',
      label: 'Profile',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.5,
      max: 20,
      step: 0.1,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 20,
      min: 6,
      max: 200,
    },
    helixAngle: {
      type: 'number',
      label: 'Helix Angle',
      default: 15,
      min: 0,
      max: 45,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 1,
      max: 200,
    },
    handedness: {
      type: 'enum',
      label: 'Handedness',
      default: 'right',
      options: ['left', 'right'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'helicalGear',
      params: {
        center: inputs.center,
        module: params.module,
        teeth: params.teeth,
        helixAngle: params.helixAngle,
        width: params.width,
        handedness: params.handedness,
      },
    });

    return {
      gear: results.gear,
      profile: results.profile,
    };
  },
};
