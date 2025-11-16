import type { NodeDefinition } from '@brepflow/types';

interface GearParams {
  ratio: number;
  reverse: boolean;
}

interface GearInputs {
  gear1: unknown;
  gear2: unknown;
}

interface GearOutputs {
  geared: unknown;
  mate: unknown;
}

export const AssemblyMatesGearNode: NodeDefinition<GearInputs, GearOutputs, GearParams> = {
  id: 'Assembly::Gear',
  category: 'Assembly',
  label: 'Gear',
  description: 'Create gear relationship',
  inputs: {
    gear1: {
      type: 'Shape',
      label: 'Gear1',
      required: true,
    },
    gear2: {
      type: 'Shape',
      label: 'Gear2',
      required: true,
    },
  },
  outputs: {
    geared: {
      type: 'Shape[]',
      label: 'Geared',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    ratio: {
      type: 'number',
      label: 'Ratio',
      default: 1,
      min: 0.1,
      max: 100,
    },
    reverse: {
      type: 'boolean',
      label: 'Reverse',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateGear',
      params: {
        gear1: inputs.gear1,
        gear2: inputs.gear2,
        ratio: params.ratio,
        reverse: params.reverse,
      },
    });

    return {
      geared: results.geared,
      mate: results.mate,
    };
  },
};
