import type { NodeDefinition } from '@brepflow/types';

interface BridgeGenerationParams {
  bridgeWidth: number;
  bridgeCount: number;
}

interface BridgeGenerationInputs {
  cutPath: unknown;
}

interface BridgeGenerationOutputs {
  bridgedPath: unknown;
}

export const FabricationLaserBridgeGenerationNode: NodeDefinition<
  BridgeGenerationInputs,
  BridgeGenerationOutputs,
  BridgeGenerationParams
> = {
  id: 'Fabrication::BridgeGeneration',
  type: 'Fabrication::BridgeGeneration',
  category: 'Fabrication',
  label: 'BridgeGeneration',
  description: 'Add holding bridges',
  inputs: {
    cutPath: {
      type: 'Wire',
      label: 'Cut Path',
      required: true,
    },
  },
  outputs: {
    bridgedPath: {
      type: 'Wire[]',
      label: 'Bridged Path',
    },
  },
  params: {
    bridgeWidth: {
      type: 'number',
      label: 'Bridge Width',
      default: 2,
      min: 0.5,
      max: 10,
    },
    bridgeCount: {
      type: 'number',
      label: 'Bridge Count',
      default: 4,
      min: 1,
      max: 20,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'bridgeGeneration',
      params: {
        cutPath: inputs.cutPath,
        bridgeWidth: params.bridgeWidth,
        bridgeCount: params.bridgeCount,
      },
    });

    return {
      bridgedPath: result,
    };
  },
};
