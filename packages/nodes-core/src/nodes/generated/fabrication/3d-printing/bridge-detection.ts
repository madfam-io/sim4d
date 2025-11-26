import type { NodeDefinition } from '@sim4d/types';

interface BridgeDetectionParams {
  maxBridge: number;
  overhangAngle: number;
}

interface BridgeDetectionInputs {
  model: unknown;
}

interface BridgeDetectionOutputs {
  bridges: unknown;
  overhangs: unknown;
}

export const Fabrication3DPrintingBridgeDetectionNode: NodeDefinition<
  BridgeDetectionInputs,
  BridgeDetectionOutputs,
  BridgeDetectionParams
> = {
  id: 'Fabrication::BridgeDetection',
  type: 'Fabrication::BridgeDetection',
  category: 'Fabrication',
  label: 'BridgeDetection',
  description: 'Detect bridges and overhangs',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    bridges: {
      type: 'Face[]',
      label: 'Bridges',
    },
    overhangs: {
      type: 'Face[]',
      label: 'Overhangs',
    },
  },
  params: {
    maxBridge: {
      type: 'number',
      label: 'Max Bridge',
      default: 5,
      min: 0,
      max: 50,
    },
    overhangAngle: {
      type: 'number',
      label: 'Overhang Angle',
      default: 45,
      min: 0,
      max: 90,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'bridgeDetection',
      params: {
        model: inputs.model,
        maxBridge: params.maxBridge,
        overhangAngle: params.overhangAngle,
      },
    });

    return {
      bridges: results.bridges,
      overhangs: results.overhangs,
    };
  },
};
