import type { NodeDefinition } from '@sim4d/types';

interface VaseModeParams {
  bottomLayers: number;
}

interface VaseModeInputs {
  model: unknown;
}

interface VaseModeOutputs {
  spiralPath: unknown;
}

export const Fabrication3DPrintingVaseModeNode: NodeDefinition<
  VaseModeInputs,
  VaseModeOutputs,
  VaseModeParams
> = {
  id: 'Fabrication::VaseMode',
  category: 'Fabrication',
  label: 'VaseMode',
  description: 'Generate vase mode spiral',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    spiralPath: {
      type: 'Wire',
      label: 'Spiral Path',
    },
  },
  params: {
    bottomLayers: {
      type: 'number',
      label: 'Bottom Layers',
      default: 3,
      min: 0,
      max: 10,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'vaseMode',
      params: {
        model: inputs.model,
        bottomLayers: params.bottomLayers,
      },
    });

    return {
      spiralPath: result,
    };
  },
};
