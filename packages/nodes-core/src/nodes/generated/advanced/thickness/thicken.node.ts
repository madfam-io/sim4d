import type { NodeDefinition } from '@brepflow/types';

interface ThickenParams {
  thickness: number;
  direction: string;
  autoClose: boolean;
}

interface ThickenInputs {
  surface: unknown;
}

interface ThickenOutputs {
  solid: unknown;
}

export const AdvancedThicknessThickenNode: NodeDefinition<
  ThickenInputs,
  ThickenOutputs,
  ThickenParams
> = {
  id: 'Advanced::Thicken',
  category: 'Advanced',
  label: 'Thicken',
  description: 'Thicken surface to solid',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    solid: {
      type: 'Shape',
      label: 'Solid',
    },
  },
  params: {
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 5,
      min: 0.01,
      max: 1000,
    },
    direction: {
      type: 'enum',
      label: 'Direction',
      default: 'normal',
      options: ['normal', 'reverse', 'both'],
    },
    autoClose: {
      type: 'boolean',
      label: 'Auto Close',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'thicken',
      params: {
        surface: inputs.surface,
        thickness: params.thickness,
        direction: params.direction,
        autoClose: params.autoClose,
      },
    });

    return {
      solid: result,
    };
  },
};
