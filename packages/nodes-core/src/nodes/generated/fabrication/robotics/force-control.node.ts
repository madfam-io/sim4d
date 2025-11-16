import type { NodeDefinition } from '@brepflow/types';

interface ForceControlParams {
  forceLimit: number;
  compliance: number;
}

interface ForceControlInputs {
  contactSurface: unknown;
}

interface ForceControlOutputs {
  forceProfile: unknown;
}

export const FabricationRoboticsForceControlNode: NodeDefinition<
  ForceControlInputs,
  ForceControlOutputs,
  ForceControlParams
> = {
  id: 'Fabrication::ForceControl',
  category: 'Fabrication',
  label: 'ForceControl',
  description: 'Force/torque control',
  inputs: {
    contactSurface: {
      type: 'Face',
      label: 'Contact Surface',
      required: true,
    },
  },
  outputs: {
    forceProfile: {
      type: 'Data',
      label: 'Force Profile',
    },
  },
  params: {
    forceLimit: {
      type: 'number',
      label: 'Force Limit',
      default: 100,
      min: 1,
      max: 1000,
    },
    compliance: {
      type: 'number',
      label: 'Compliance',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'forceControl',
      params: {
        contactSurface: inputs.contactSurface,
        forceLimit: params.forceLimit,
        compliance: params.compliance,
      },
    });

    return {
      forceProfile: result,
    };
  },
};
