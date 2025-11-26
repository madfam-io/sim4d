import type { NodeDefinition } from '@sim4d/types';

interface LivingHingeParams {
  pattern: string;
  spacing: number;
  cutLength: number;
}

interface LivingHingeInputs {
  hingeArea: unknown;
}

interface LivingHingeOutputs {
  hingePattern: unknown;
}

export const FabricationLaserLivingHingeNode: NodeDefinition<
  LivingHingeInputs,
  LivingHingeOutputs,
  LivingHingeParams
> = {
  id: 'Fabrication::LivingHinge',
  category: 'Fabrication',
  label: 'LivingHinge',
  description: 'Generate living hinge pattern',
  inputs: {
    hingeArea: {
      type: 'Face',
      label: 'Hinge Area',
      required: true,
    },
  },
  outputs: {
    hingePattern: {
      type: 'Wire[]',
      label: 'Hinge Pattern',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'straight',
      options: ['straight', 'wave', 'diamond', 'honeycomb'],
    },
    spacing: {
      type: 'number',
      label: 'Spacing',
      default: 2,
      min: 0.5,
      max: 10,
    },
    cutLength: {
      type: 'number',
      label: 'Cut Length',
      default: 10,
      min: 1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'livingHinge',
      params: {
        hingeArea: inputs.hingeArea,
        pattern: params.pattern,
        spacing: params.spacing,
        cutLength: params.cutLength,
      },
    });

    return {
      hingePattern: result,
    };
  },
};
