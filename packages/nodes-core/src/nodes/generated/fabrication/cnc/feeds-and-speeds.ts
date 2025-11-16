import type { NodeDefinition } from '@brepflow/types';

interface FeedsAndSpeedsParams {
  material: string;
  toolMaterial: string;
  toolDiameter: number;
}

type FeedsAndSpeedsInputs = Record<string, never>;

interface FeedsAndSpeedsOutputs {
  spindleSpeed: number;
  feedRate: number;
  chipLoad: number;
}

export const FabricationCNCFeedsAndSpeedsNode: NodeDefinition<
  FeedsAndSpeedsInputs,
  FeedsAndSpeedsOutputs,
  FeedsAndSpeedsParams
> = {
  id: 'Fabrication::FeedsAndSpeeds',
  type: 'Fabrication::FeedsAndSpeeds',
  category: 'Fabrication',
  label: 'FeedsAndSpeeds',
  description: 'Calculate feeds and speeds',
  inputs: {},
  outputs: {
    spindleSpeed: {
      type: 'Number',
      label: 'Spindle Speed',
    },
    feedRate: {
      type: 'Number',
      label: 'Feed Rate',
    },
    chipLoad: {
      type: 'Number',
      label: 'Chip Load',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'aluminum',
      options: ['aluminum', 'steel', 'stainless', 'titanium', 'plastic', 'wood'],
    },
    toolMaterial: {
      type: 'enum',
      label: 'Tool Material',
      default: 'carbide',
      options: ['hss', 'carbide', 'ceramic', 'diamond'],
    },
    toolDiameter: {
      type: 'number',
      label: 'Tool Diameter',
      default: 6,
      min: 0.1,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'feedsAndSpeeds',
      params: {
        material: params.material,
        toolMaterial: params.toolMaterial,
        toolDiameter: params.toolDiameter,
      },
    });

    return {
      spindleSpeed: results.spindleSpeed,
      feedRate: results.feedRate,
      chipLoad: results.chipLoad,
    };
  },
};
