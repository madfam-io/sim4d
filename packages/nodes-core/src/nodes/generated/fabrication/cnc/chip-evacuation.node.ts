import type { NodeDefinition } from '@brepflow/types';

interface ChipEvacuationParams {
  flutes: number;
  helixAngle: number;
}

interface ChipEvacuationInputs {
  pocket: unknown;
}

interface ChipEvacuationOutputs {
  evacuationScore: number;
}

export const FabricationCNCChipEvacuationNode: NodeDefinition<
  ChipEvacuationInputs,
  ChipEvacuationOutputs,
  ChipEvacuationParams
> = {
  id: 'Fabrication::ChipEvacuation',
  category: 'Fabrication',
  label: 'ChipEvacuation',
  description: 'Chip evacuation analysis',
  inputs: {
    pocket: {
      type: 'Face',
      label: 'Pocket',
      required: true,
    },
  },
  outputs: {
    evacuationScore: {
      type: 'Number',
      label: 'Evacuation Score',
    },
  },
  params: {
    flutes: {
      type: 'number',
      label: 'Flutes',
      default: 2,
      min: 1,
      max: 8,
      step: 1,
    },
    helixAngle: {
      type: 'number',
      label: 'Helix Angle',
      default: 30,
      min: 0,
      max: 60,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'chipEvacuation',
      params: {
        pocket: inputs.pocket,
        flutes: params.flutes,
        helixAngle: params.helixAngle,
      },
    });

    return {
      evacuationScore: result,
    };
  },
};
