import type { NodeDefinition } from '@brepflow/types';

interface SpiralStairParams {
  diameter: number;
  totalRise: number;
  rotation: number;
  centerPole: boolean;
}

interface SpiralStairInputs {
  centerPoint: [number, number, number];
}

interface SpiralStairOutputs {
  spiralStair: unknown;
  centerPole: unknown;
}

export const ArchitectureStairsSpiralStairNode: NodeDefinition<
  SpiralStairInputs,
  SpiralStairOutputs,
  SpiralStairParams
> = {
  id: 'Architecture::SpiralStair',
  type: 'Architecture::SpiralStair',
  category: 'Architecture',
  label: 'SpiralStair',
  description: 'Spiral staircase',
  inputs: {
    centerPoint: {
      type: 'Point',
      label: 'Center Point',
      required: true,
    },
  },
  outputs: {
    spiralStair: {
      type: 'Shape',
      label: 'Spiral Stair',
    },
    centerPole: {
      type: 'Shape',
      label: 'Center Pole',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 2000,
      min: 1200,
      max: 3000,
    },
    totalRise: {
      type: 'number',
      label: 'Total Rise',
      default: 3000,
      min: 1000,
      max: 6000,
    },
    rotation: {
      type: 'number',
      label: 'Rotation',
      default: 360,
      min: 270,
      max: 720,
    },
    centerPole: {
      type: 'boolean',
      label: 'Center Pole',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'spiralStair',
      params: {
        centerPoint: inputs.centerPoint,
        diameter: params.diameter,
        totalRise: params.totalRise,
        rotation: params.rotation,
        centerPole: params.centerPole,
      },
    });

    return {
      spiralStair: results.spiralStair,
      centerPole: results.centerPole,
    };
  },
};
