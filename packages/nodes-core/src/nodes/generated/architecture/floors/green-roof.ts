import type { NodeDefinition } from '@brepflow/types';

interface GreenRoofParams {
  type: string;
  soilDepth: number;
}

interface GreenRoofInputs {
  roofSurface: unknown;
}

interface GreenRoofOutputs {
  greenRoof: unknown;
  layers: unknown;
}

export const ArchitectureFloorsGreenRoofNode: NodeDefinition<
  GreenRoofInputs,
  GreenRoofOutputs,
  GreenRoofParams
> = {
  id: 'Architecture::GreenRoof',
  type: 'Architecture::GreenRoof',
  category: 'Architecture',
  label: 'GreenRoof',
  description: 'Green roof system',
  inputs: {
    roofSurface: {
      type: 'Face',
      label: 'Roof Surface',
      required: true,
    },
  },
  outputs: {
    greenRoof: {
      type: 'Shape',
      label: 'Green Roof',
    },
    layers: {
      type: 'Shape[]',
      label: 'Layers',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'extensive',
      options: ['extensive', 'intensive', 'semi-intensive'],
    },
    soilDepth: {
      type: 'number',
      label: 'Soil Depth',
      default: 100,
      min: 50,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'greenRoof',
      params: {
        roofSurface: inputs.roofSurface,
        type: params.type,
        soilDepth: params.soilDepth,
      },
    });

    return {
      greenRoof: results.greenRoof,
      layers: results.layers,
    };
  },
};
