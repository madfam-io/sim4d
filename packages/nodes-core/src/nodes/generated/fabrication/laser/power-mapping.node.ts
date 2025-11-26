import type { NodeDefinition } from '@sim4d/types';

interface PowerMappingParams {
  material: string;
  thickness: number;
  wattage: number;
}

interface PowerMappingInputs {
  geometry: unknown;
}

interface PowerMappingOutputs {
  powerSettings: unknown;
}

export const FabricationLaserPowerMappingNode: NodeDefinition<
  PowerMappingInputs,
  PowerMappingOutputs,
  PowerMappingParams
> = {
  id: 'Fabrication::PowerMapping',
  category: 'Fabrication',
  label: 'PowerMapping',
  description: 'Map laser power settings',
  inputs: {
    geometry: {
      type: 'Wire[]',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    powerSettings: {
      type: 'Data',
      label: 'Power Settings',
    },
  },
  params: {
    material: {
      type: 'enum',
      label: 'Material',
      default: 'acrylic',
      options: ['acrylic', 'wood', 'mdf', 'cardboard', 'leather', 'fabric'],
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 3,
      min: 0.1,
      max: 50,
    },
    wattage: {
      type: 'number',
      label: 'Wattage',
      default: 60,
      min: 10,
      max: 500,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'powerMapping',
      params: {
        geometry: inputs.geometry,
        material: params.material,
        thickness: params.thickness,
        wattage: params.wattage,
      },
    });

    return {
      powerSettings: result,
    };
  },
};
