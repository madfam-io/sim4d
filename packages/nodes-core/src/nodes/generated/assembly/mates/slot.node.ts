import type { NodeDefinition } from '@brepflow/types';

interface SlotParams {
  freeRotation: boolean;
}

interface SlotInputs {
  slot: unknown;
  slider: unknown;
}

interface SlotOutputs {
  slotted: unknown;
  mate: unknown;
}

export const AssemblyMatesSlotNode: NodeDefinition<SlotInputs, SlotOutputs, SlotParams> = {
  id: 'Assembly::Slot',
  category: 'Assembly',
  label: 'Slot',
  description: 'Create slot constraint',
  inputs: {
    slot: {
      type: 'Shape',
      label: 'Slot',
      required: true,
    },
    slider: {
      type: 'Shape',
      label: 'Slider',
      required: true,
    },
  },
  outputs: {
    slotted: {
      type: 'Shape[]',
      label: 'Slotted',
    },
    mate: {
      type: 'Mate',
      label: 'Mate',
    },
  },
  params: {
    freeRotation: {
      type: 'boolean',
      label: 'Free Rotation',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'mateSlot',
      params: {
        slot: inputs.slot,
        slider: inputs.slider,
        freeRotation: params.freeRotation,
      },
    });

    return {
      slotted: results.slotted,
      mate: results.mate,
    };
  },
};
