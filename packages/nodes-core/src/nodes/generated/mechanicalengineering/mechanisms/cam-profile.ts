import type { NodeDefinition } from '@sim4d/types';

interface CamProfileParams {
  baseRadius: number;
  lift: number;
  profileType: string;
  dwellAngle: number;
}

interface CamProfileInputs {
  center: [number, number, number];
  customProfile?: unknown;
}

interface CamProfileOutputs {
  cam: unknown;
  profile: unknown;
}

export const MechanicalEngineeringMechanismsCamProfileNode: NodeDefinition<
  CamProfileInputs,
  CamProfileOutputs,
  CamProfileParams
> = {
  id: 'MechanicalEngineering::CamProfile',
  type: 'MechanicalEngineering::CamProfile',
  category: 'MechanicalEngineering',
  label: 'CamProfile',
  description: 'Create cam profile',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
    customProfile: {
      type: 'Wire',
      label: 'Custom Profile',
      optional: true,
    },
  },
  outputs: {
    cam: {
      type: 'Shape',
      label: 'Cam',
    },
    profile: {
      type: 'Wire',
      label: 'Profile',
    },
  },
  params: {
    baseRadius: {
      type: 'number',
      label: 'Base Radius',
      default: 30,
      min: 10,
      max: 100,
    },
    lift: {
      type: 'number',
      label: 'Lift',
      default: 10,
      min: 2,
      max: 50,
    },
    profileType: {
      type: 'enum',
      label: 'Profile Type',
      default: 'harmonic',
      options: ['harmonic', 'cycloidal', 'parabolic', 'custom'],
    },
    dwellAngle: {
      type: 'number',
      label: 'Dwell Angle',
      default: 60,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'camProfile',
      params: {
        center: inputs.center,
        customProfile: inputs.customProfile,
        baseRadius: params.baseRadius,
        lift: params.lift,
        profileType: params.profileType,
        dwellAngle: params.dwellAngle,
      },
    });

    return {
      cam: results.cam,
      profile: results.profile,
    };
  },
};
