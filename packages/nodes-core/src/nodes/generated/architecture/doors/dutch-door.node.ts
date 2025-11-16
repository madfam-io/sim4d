import type { NodeDefinition } from '@brepflow/types';

interface DutchDoorParams {
  splitHeight: number;
  topOpen: boolean;
  bottomOpen: boolean;
}

interface DutchDoorInputs {
  opening: unknown;
}

interface DutchDoorOutputs {
  topDoor: unknown;
  bottomDoor: unknown;
}

export const ArchitectureDoorsDutchDoorNode: NodeDefinition<
  DutchDoorInputs,
  DutchDoorOutputs,
  DutchDoorParams
> = {
  id: 'Architecture::DutchDoor',
  category: 'Architecture',
  label: 'DutchDoor',
  description: 'Dutch split door',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    topDoor: {
      type: 'Shape',
      label: 'Top Door',
    },
    bottomDoor: {
      type: 'Shape',
      label: 'Bottom Door',
    },
  },
  params: {
    splitHeight: {
      type: 'number',
      label: 'Split Height',
      default: 1050,
      min: 900,
      max: 1200,
    },
    topOpen: {
      type: 'boolean',
      label: 'Top Open',
      default: false,
    },
    bottomOpen: {
      type: 'boolean',
      label: 'Bottom Open',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'dutchDoor',
      params: {
        opening: inputs.opening,
        splitHeight: params.splitHeight,
        topOpen: params.topOpen,
        bottomOpen: params.bottomOpen,
      },
    });

    return {
      topDoor: results.topDoor,
      bottomDoor: results.bottomDoor,
    };
  },
};
