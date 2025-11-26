import type { NodeDefinition } from '@sim4d/types';

interface PalletizingPatternParams {
  pattern: string;
  layersCount: number;
}

interface PalletizingPatternInputs {
  boxSize: [number, number, number];
  palletSize: [number, number, number];
}

interface PalletizingPatternOutputs {
  placementPoints: unknown;
}

export const FabricationRoboticsPalletizingPatternNode: NodeDefinition<
  PalletizingPatternInputs,
  PalletizingPatternOutputs,
  PalletizingPatternParams
> = {
  id: 'Fabrication::PalletizingPattern',
  type: 'Fabrication::PalletizingPattern',
  category: 'Fabrication',
  label: 'PalletizingPattern',
  description: 'Palletizing patterns',
  inputs: {
    boxSize: {
      type: 'Vector',
      label: 'Box Size',
      required: true,
    },
    palletSize: {
      type: 'Vector',
      label: 'Pallet Size',
      required: true,
    },
  },
  outputs: {
    placementPoints: {
      type: 'Transform[]',
      label: 'Placement Points',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'interlocked',
      options: ['column', 'interlocked', 'pinwheel', 'split-row'],
    },
    layersCount: {
      type: 'number',
      label: 'Layers Count',
      default: 10,
      min: 1,
      max: 50,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'palletizingPattern',
      params: {
        boxSize: inputs.boxSize,
        palletSize: inputs.palletSize,
        pattern: params.pattern,
        layersCount: params.layersCount,
      },
    });

    return {
      placementPoints: result,
    };
  },
};
