import type { NodeDefinition } from '@sim4d/types';

interface RainScreenParams {
  claddingType: string;
  ventGap: number;
}

interface RainScreenInputs {
  wall: unknown;
}

interface RainScreenOutputs {
  rainScreen: unknown;
}

export const ArchitectureWallsRainScreenNode: NodeDefinition<
  RainScreenInputs,
  RainScreenOutputs,
  RainScreenParams
> = {
  id: 'Architecture::RainScreen',
  category: 'Architecture',
  label: 'RainScreen',
  description: 'Rainscreen cladding system',
  inputs: {
    wall: {
      type: 'Shape',
      label: 'Wall',
      required: true,
    },
  },
  outputs: {
    rainScreen: {
      type: 'Shape',
      label: 'Rain Screen',
    },
  },
  params: {
    claddingType: {
      type: 'enum',
      label: 'Cladding Type',
      default: 'composite',
      options: ['metal', 'composite', 'terracotta', 'wood'],
    },
    ventGap: {
      type: 'number',
      label: 'Vent Gap',
      default: 25,
      min: 20,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'rainScreen',
      params: {
        wall: inputs.wall,
        claddingType: params.claddingType,
        ventGap: params.ventGap,
      },
    });

    return {
      rainScreen: result,
    };
  },
};
