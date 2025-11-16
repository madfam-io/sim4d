import type { NodeDefinition } from '@brepflow/types';

interface TrochoidalMillingParams {
  trochoidWidth: number;
  stepover: number;
}

interface TrochoidalMillingInputs {
  slot: unknown;
}

interface TrochoidalMillingOutputs {
  trochoidalPath: unknown;
}

export const FabricationCNCTrochoidalMillingNode: NodeDefinition<
  TrochoidalMillingInputs,
  TrochoidalMillingOutputs,
  TrochoidalMillingParams
> = {
  id: 'Fabrication::TrochoidalMilling',
  category: 'Fabrication',
  label: 'TrochoidalMilling',
  description: 'Trochoidal milling paths',
  inputs: {
    slot: {
      type: 'Wire',
      label: 'Slot',
      required: true,
    },
  },
  outputs: {
    trochoidalPath: {
      type: 'Wire',
      label: 'Trochoidal Path',
    },
  },
  params: {
    trochoidWidth: {
      type: 'number',
      label: 'Trochoid Width',
      default: 2,
      min: 0.5,
      max: 10,
    },
    stepover: {
      type: 'number',
      label: 'Stepover',
      default: 0.3,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'trochoidalMilling',
      params: {
        slot: inputs.slot,
        trochoidWidth: params.trochoidWidth,
        stepover: params.stepover,
      },
    });

    return {
      trochoidalPath: result,
    };
  },
};
