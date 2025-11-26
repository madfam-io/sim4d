import type { NodeDefinition } from '@sim4d/types';

interface RemoveFeaturesParams {
  minSize: number;
  removeHoles: boolean;
  removeFillets: boolean;
  removeChamfers: boolean;
}

interface RemoveFeaturesInputs {
  shape: unknown;
}

interface RemoveFeaturesOutputs {
  simplified: unknown;
}

export const AdvancedHealingRemoveFeaturesNode: NodeDefinition<
  RemoveFeaturesInputs,
  RemoveFeaturesOutputs,
  RemoveFeaturesParams
> = {
  id: 'Advanced::RemoveFeatures',
  type: 'Advanced::RemoveFeatures',
  category: 'Advanced',
  label: 'RemoveFeatures',
  description: 'Remove small features',
  inputs: {
    shape: {
      type: 'Shape',
      label: 'Shape',
      required: true,
    },
  },
  outputs: {
    simplified: {
      type: 'Shape',
      label: 'Simplified',
    },
  },
  params: {
    minSize: {
      type: 'number',
      label: 'Min Size',
      default: 0.5,
      min: 0.01,
      max: 100,
    },
    removeHoles: {
      type: 'boolean',
      label: 'Remove Holes',
      default: true,
    },
    removeFillets: {
      type: 'boolean',
      label: 'Remove Fillets',
      default: false,
    },
    removeChamfers: {
      type: 'boolean',
      label: 'Remove Chamfers',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'removeFeatures',
      params: {
        shape: inputs.shape,
        minSize: params.minSize,
        removeHoles: params.removeHoles,
        removeFillets: params.removeFillets,
        removeChamfers: params.removeChamfers,
      },
    });

    return {
      simplified: result,
    };
  },
};
