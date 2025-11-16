import type { NodeDefinition } from '@brepflow/types';

interface SteppedShaftParams {
  sections: string;
  chamfers: boolean;
  filletRadius: number;
}

interface SteppedShaftInputs {
  centerline: unknown;
}

interface SteppedShaftOutputs {
  shaft: unknown;
  sections: unknown;
}

export const MechanicalEngineeringShaftsSteppedShaftNode: NodeDefinition<
  SteppedShaftInputs,
  SteppedShaftOutputs,
  SteppedShaftParams
> = {
  id: 'MechanicalEngineering::SteppedShaft',
  type: 'MechanicalEngineering::SteppedShaft',
  category: 'MechanicalEngineering',
  label: 'SteppedShaft',
  description: 'Create stepped shaft',
  inputs: {
    centerline: {
      type: 'Wire',
      label: 'Centerline',
      required: true,
    },
  },
  outputs: {
    shaft: {
      type: 'Shape',
      label: 'Shaft',
    },
    sections: {
      type: 'Shape[]',
      label: 'Sections',
    },
  },
  params: {
    sections: {
      type: 'string',
      label: 'Sections',
      default: '20x50,25x80,20x30',
    },
    chamfers: {
      type: 'boolean',
      label: 'Chamfers',
      default: true,
    },
    filletRadius: {
      type: 'number',
      label: 'Fillet Radius',
      default: 1,
      min: 0.5,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'steppedShaft',
      params: {
        centerline: inputs.centerline,
        sections: params.sections,
        chamfers: params.chamfers,
        filletRadius: params.filletRadius,
      },
    });

    return {
      shaft: results.shaft,
      sections: results.sections,
    };
  },
};
