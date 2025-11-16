import type { NodeDefinition } from '@brepflow/types';

interface LayerSeparationParams {
  separateBy: string;
}

interface LayerSeparationInputs {
  drawing: unknown;
}

interface LayerSeparationOutputs {
  layers: unknown;
}

export const FabricationLaserLayerSeparationNode: NodeDefinition<
  LayerSeparationInputs,
  LayerSeparationOutputs,
  LayerSeparationParams
> = {
  id: 'Fabrication::LayerSeparation',
  type: 'Fabrication::LayerSeparation',
  category: 'Fabrication',
  label: 'LayerSeparation',
  description: 'Separate by layer/color',
  inputs: {
    drawing: {
      type: 'Wire[]',
      label: 'Drawing',
      required: true,
    },
  },
  outputs: {
    layers: {
      type: 'Wire[][]',
      label: 'Layers',
    },
  },
  params: {
    separateBy: {
      type: 'enum',
      label: 'Separate By',
      default: 'color',
      options: ['color', 'layer', 'lineweight'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'layerSeparation',
      params: {
        drawing: inputs.drawing,
        separateBy: params.separateBy,
      },
    });

    return {
      layers: result,
    };
  },
};
