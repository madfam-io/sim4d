import type { NodeDefinition } from '@brepflow/types';

interface AdaptiveLayerHeightParams {
  minHeight: number;
  maxHeight: number;
  quality: number;
}

interface AdaptiveLayerHeightInputs {
  model: unknown;
}

interface AdaptiveLayerHeightOutputs {
  layerHeights: number[];
}

export const Fabrication3DPrintingAdaptiveLayerHeightNode: NodeDefinition<
  AdaptiveLayerHeightInputs,
  AdaptiveLayerHeightOutputs,
  AdaptiveLayerHeightParams
> = {
  id: 'Fabrication::AdaptiveLayerHeight',
  type: 'Fabrication::AdaptiveLayerHeight',
  category: 'Fabrication',
  label: 'AdaptiveLayerHeight',
  description: 'Adaptive layer height calculation',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    layerHeights: {
      type: 'Number[]',
      label: 'Layer Heights',
    },
  },
  params: {
    minHeight: {
      type: 'number',
      label: 'Min Height',
      default: 0.1,
      min: 0.05,
      max: 0.5,
    },
    maxHeight: {
      type: 'number',
      label: 'Max Height',
      default: 0.3,
      min: 0.1,
      max: 1,
    },
    quality: {
      type: 'number',
      label: 'Quality',
      default: 0.5,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'adaptiveLayerHeight',
      params: {
        model: inputs.model,
        minHeight: params.minHeight,
        maxHeight: params.maxHeight,
        quality: params.quality,
      },
    });

    return {
      layerHeights: result,
    };
  },
};
