import type { NodeDefinition } from '@sim4d/types';

interface MotionDriverParams {
  motionType: string;
  velocity: number;
  acceleration: number;
  period: number;
}

interface MotionDriverInputs {
  joint: unknown;
  motionProfile?: unknown;
}

interface MotionDriverOutputs {
  drivenJoint: unknown;
}

export const SimulationKinematicsMotionDriverNode: NodeDefinition<
  MotionDriverInputs,
  MotionDriverOutputs,
  MotionDriverParams
> = {
  id: 'Simulation::MotionDriver',
  category: 'Simulation',
  label: 'MotionDriver',
  description: 'Define motion driver',
  inputs: {
    joint: {
      type: 'Data',
      label: 'Joint',
      required: true,
    },
    motionProfile: {
      type: 'Data',
      label: 'Motion Profile',
      optional: true,
    },
  },
  outputs: {
    drivenJoint: {
      type: 'Data',
      label: 'Driven Joint',
    },
  },
  params: {
    motionType: {
      type: 'enum',
      label: 'Motion Type',
      default: 'constant',
      options: ['constant', 'harmonic', 'profile', 'expression'],
    },
    velocity: {
      type: 'number',
      label: 'Velocity',
      default: 1,
      min: -1000,
      max: 1000,
    },
    acceleration: {
      type: 'number',
      label: 'Acceleration',
      default: 0,
      min: -1000,
      max: 1000,
    },
    period: {
      type: 'number',
      label: 'Period',
      default: 1,
      min: 0.001,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'motionDriver',
      params: {
        joint: inputs.joint,
        motionProfile: inputs.motionProfile,
        motionType: params.motionType,
        velocity: params.velocity,
        acceleration: params.acceleration,
        period: params.period,
      },
    });

    return {
      drivenJoint: result,
    };
  },
};
