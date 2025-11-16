import type { NodeDefinition } from '@brepflow/types';

interface SlotParams {
  slotWidth: number;
  slotDepth: number;
  clearance: number;
}

interface SlotInputs {
  sheet: unknown;
  edge: unknown;
  position: [number, number, number];
}

interface SlotOutputs {
  result: unknown;
}

export const SheetMetalFeaturesSlotNode: NodeDefinition<SlotInputs, SlotOutputs, SlotParams> = {
  id: 'SheetMetal::Slot',
  type: 'SheetMetal::Slot',
  category: 'SheetMetal',
  label: 'Slot',
  description: 'Create slot for tab',
  inputs: {
    sheet: {
      type: 'Shape',
      label: 'Sheet',
      required: true,
    },
    edge: {
      type: 'Edge',
      label: 'Edge',
      required: true,
    },
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape',
      label: 'Result',
    },
  },
  params: {
    slotWidth: {
      type: 'number',
      label: 'Slot Width',
      default: 20,
      min: 0.1,
      max: 500,
    },
    slotDepth: {
      type: 'number',
      label: 'Slot Depth',
      default: 10,
      min: 0.1,
      max: 100,
    },
    clearance: {
      type: 'number',
      label: 'Clearance',
      default: 0.2,
      min: 0,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'sheetSlot',
      params: {
        sheet: inputs.sheet,
        edge: inputs.edge,
        position: inputs.position,
        slotWidth: params.slotWidth,
        slotDepth: params.slotDepth,
        clearance: params.clearance,
      },
    });

    return {
      result: result,
    };
  },
};
