import type { NodeDefinition } from '@sim4d/types';

interface RotaryAttachmentParams {
  diameter: number;
  stepsPerRotation: number;
}

interface RotaryAttachmentInputs {
  cylindricalPattern: unknown;
}

interface RotaryAttachmentOutputs {
  unwrappedPattern: unknown;
}

export const FabricationLaserRotaryAttachmentNode: NodeDefinition<
  RotaryAttachmentInputs,
  RotaryAttachmentOutputs,
  RotaryAttachmentParams
> = {
  id: 'Fabrication::RotaryAttachment',
  category: 'Fabrication',
  label: 'RotaryAttachment',
  description: 'Setup rotary cutting',
  inputs: {
    cylindricalPattern: {
      type: 'Wire[]',
      label: 'Cylindrical Pattern',
      required: true,
    },
  },
  outputs: {
    unwrappedPattern: {
      type: 'Wire[]',
      label: 'Unwrapped Pattern',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 100,
      min: 10,
      max: 500,
    },
    stepsPerRotation: {
      type: 'number',
      label: 'Steps Per Rotation',
      default: 10000,
      min: 100,
      max: 100000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'rotaryAttachment',
      params: {
        cylindricalPattern: inputs.cylindricalPattern,
        diameter: params.diameter,
        stepsPerRotation: params.stepsPerRotation,
      },
    });

    return {
      unwrappedPattern: result,
    };
  },
};
