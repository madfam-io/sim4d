import type { NodeDefinition } from '@brepflow/types';

interface SlotParams {
  centerX: number;
  centerY: number;
  length: number;
  width: number;
  angle: number;
}

type SlotInputs = Record<string, never>;

interface SlotOutputs {
  face: unknown;
}

export const SketchBasicSlotNode: NodeDefinition<SlotInputs, SlotOutputs, SlotParams> = {
  id: 'Sketch::Slot',
  category: 'Sketch',
  label: 'Slot',
  description: 'Create a slot (rounded rectangle)',
  inputs: {},
  outputs: {
    face: {
      type: 'Face',
      label: 'Face',
    },
  },
  params: {
    centerX: {
      type: 'number',
      label: 'Center X',
      default: 0,
      min: -10000,
      max: 10000,
    },
    centerY: {
      type: 'number',
      label: 'Center Y',
      default: 0,
      min: -10000,
      max: 10000,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 100,
      min: 0.1,
      max: 10000,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 0.1,
      max: 10000,
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 0,
      min: -180,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeSlot',
      params: {
        centerX: params.centerX,
        centerY: params.centerY,
        length: params.length,
        width: params.width,
        angle: params.angle,
      },
    });

    return {
      face: result,
    };
  },
};
