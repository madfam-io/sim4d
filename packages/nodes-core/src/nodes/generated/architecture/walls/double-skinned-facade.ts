import type { NodeDefinition } from '@sim4d/types';

interface DoubleSkinnedFacadeParams {
  cavityWidth: number;
  ventilationType: string;
}

interface DoubleSkinnedFacadeInputs {
  buildingFace: unknown;
}

interface DoubleSkinnedFacadeOutputs {
  innerSkin: unknown;
  outerSkin: unknown;
  cavity: unknown;
}

export const ArchitectureWallsDoubleSkinnedFacadeNode: NodeDefinition<
  DoubleSkinnedFacadeInputs,
  DoubleSkinnedFacadeOutputs,
  DoubleSkinnedFacadeParams
> = {
  id: 'Architecture::DoubleSkinnedFacade',
  type: 'Architecture::DoubleSkinnedFacade',
  category: 'Architecture',
  label: 'DoubleSkinnedFacade',
  description: 'Double-skin facade system',
  inputs: {
    buildingFace: {
      type: 'Face',
      label: 'Building Face',
      required: true,
    },
  },
  outputs: {
    innerSkin: {
      type: 'Shape',
      label: 'Inner Skin',
    },
    outerSkin: {
      type: 'Shape',
      label: 'Outer Skin',
    },
    cavity: {
      type: 'Shape',
      label: 'Cavity',
    },
  },
  params: {
    cavityWidth: {
      type: 'number',
      label: 'Cavity Width',
      default: 600,
      min: 300,
      max: 1500,
    },
    ventilationType: {
      type: 'enum',
      label: 'Ventilation Type',
      default: 'natural',
      options: ['natural', 'mechanical', 'hybrid'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'doubleSkinned Facade',
      params: {
        buildingFace: inputs.buildingFace,
        cavityWidth: params.cavityWidth,
        ventilationType: params.ventilationType,
      },
    });

    return {
      innerSkin: results.innerSkin,
      outerSkin: results.outerSkin,
      cavity: results.cavity,
    };
  },
};
