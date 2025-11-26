import type { NodeDefinition } from '@sim4d/types';

interface RollupDoorParams {
  slatHeight: number;
  openHeight: number;
}

interface RollupDoorInputs {
  opening: unknown;
}

interface RollupDoorOutputs {
  rollupDoor: unknown;
  guides: unknown;
}

export const ArchitectureDoorsRollupDoorNode: NodeDefinition<
  RollupDoorInputs,
  RollupDoorOutputs,
  RollupDoorParams
> = {
  id: 'Architecture::RollupDoor',
  category: 'Architecture',
  label: 'RollupDoor',
  description: 'Roll-up garage door',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    rollupDoor: {
      type: 'Shape',
      label: 'Rollup Door',
    },
    guides: {
      type: 'Shape[]',
      label: 'Guides',
    },
  },
  params: {
    slatHeight: {
      type: 'number',
      label: 'Slat Height',
      default: 75,
      min: 50,
      max: 100,
    },
    openHeight: {
      type: 'number',
      label: 'Open Height',
      default: 0,
      min: 0,
      max: 3000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rollupDoor',
      params: {
        opening: inputs.opening,
        slatHeight: params.slatHeight,
        openHeight: params.openHeight,
      },
    });

    return {
      rollupDoor: results.rollupDoor,
      guides: results.guides,
    };
  },
};
