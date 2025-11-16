import type { NodeDefinition } from '@brepflow/types';

interface SingleDoorParams {
  width: number;
  height: number;
  thickness: number;
  swing: string;
  opening: number;
}

interface SingleDoorInputs {
  position: [number, number, number];
  wall?: unknown;
}

interface SingleDoorOutputs {
  door: unknown;
  frame: unknown;
}

export const ArchitectureDoorsSingleDoorNode: NodeDefinition<
  SingleDoorInputs,
  SingleDoorOutputs,
  SingleDoorParams
> = {
  id: 'Architecture::SingleDoor',
  type: 'Architecture::SingleDoor',
  category: 'Architecture',
  label: 'SingleDoor',
  description: 'Single swing door',
  inputs: {
    position: {
      type: 'Point',
      label: 'Position',
      required: true,
    },
    wall: {
      type: 'Shape',
      label: 'Wall',
      optional: true,
    },
  },
  outputs: {
    door: {
      type: 'Shape',
      label: 'Door',
    },
    frame: {
      type: 'Shape',
      label: 'Frame',
    },
  },
  params: {
    width: {
      type: 'number',
      label: 'Width',
      default: 900,
      min: 600,
      max: 1200,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 2100,
      min: 1800,
      max: 2400,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 45,
      min: 35,
      max: 60,
    },
    swing: {
      type: 'enum',
      label: 'Swing',
      default: 'right',
      options: ['left', 'right'],
    },
    opening: {
      type: 'number',
      label: 'Opening',
      default: 0,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'singleDoor',
      params: {
        position: inputs.position,
        wall: inputs.wall,
        width: params.width,
        height: params.height,
        thickness: params.thickness,
        swing: params.swing,
        opening: params.opening,
      },
    });

    return {
      door: results.door,
      frame: results.frame,
    };
  },
};
