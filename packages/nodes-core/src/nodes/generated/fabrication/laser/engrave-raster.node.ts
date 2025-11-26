import type { NodeDefinition } from '@sim4d/types';

interface EngraveRasterParams {
  resolution: number;
  dithering: string;
}

interface EngraveRasterInputs {
  image: unknown;
  boundary: unknown;
}

interface EngraveRasterOutputs {
  rasterData: unknown;
}

export const FabricationLaserEngraveRasterNode: NodeDefinition<
  EngraveRasterInputs,
  EngraveRasterOutputs,
  EngraveRasterParams
> = {
  id: 'Fabrication::EngraveRaster',
  category: 'Fabrication',
  label: 'EngraveRaster',
  description: 'Generate raster engraving',
  inputs: {
    image: {
      type: 'Data',
      label: 'Image',
      required: true,
    },
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    rasterData: {
      type: 'Data',
      label: 'Raster Data',
    },
  },
  params: {
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 300,
      min: 100,
      max: 1200,
    },
    dithering: {
      type: 'enum',
      label: 'Dithering',
      default: 'floyd-steinberg',
      options: ['none', 'floyd-steinberg', 'ordered', 'random'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'engraveRaster',
      params: {
        image: inputs.image,
        boundary: inputs.boundary,
        resolution: params.resolution,
        dithering: params.dithering,
      },
    });

    return {
      rasterData: result,
    };
  },
};
