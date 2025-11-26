import type { NodeDefinition } from '@sim4d/types';

interface WipeTowerParams {
  towerWidth: number;
  wipeVolume: number;
}

interface WipeTowerInputs {
  printHeight: number;
}

interface WipeTowerOutputs {
  tower: unknown;
}

export const Fabrication3DPrintingWipeTowerNode: NodeDefinition<
  WipeTowerInputs,
  WipeTowerOutputs,
  WipeTowerParams
> = {
  id: 'Fabrication::WipeTower',
  category: 'Fabrication',
  label: 'WipeTower',
  description: 'Generate wipe tower',
  inputs: {
    printHeight: {
      type: 'Number',
      label: 'Print Height',
      required: true,
    },
  },
  outputs: {
    tower: {
      type: 'Shape',
      label: 'Tower',
    },
  },
  params: {
    towerWidth: {
      type: 'number',
      label: 'Tower Width',
      default: 60,
      min: 20,
      max: 100,
    },
    wipeVolume: {
      type: 'number',
      label: 'Wipe Volume',
      default: 15,
      min: 5,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'wipeTower',
      params: {
        printHeight: inputs.printHeight,
        towerWidth: params.towerWidth,
        wipeVolume: params.wipeVolume,
      },
    });

    return {
      tower: result,
    };
  },
};
