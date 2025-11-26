import type { NodeDefinition } from '@sim4d/types';

interface AirAssistParams {
  pressure: number;
  nozzleType: string;
}

interface AirAssistInputs {
  material: unknown;
}

interface AirAssistOutputs {
  airSettings: unknown;
}

export const FabricationLaserAirAssistNode: NodeDefinition<
  AirAssistInputs,
  AirAssistOutputs,
  AirAssistParams
> = {
  id: 'Fabrication::AirAssist',
  category: 'Fabrication',
  label: 'AirAssist',
  description: 'Air assist optimization',
  inputs: {
    material: {
      type: 'Data',
      label: 'Material',
      required: true,
    },
  },
  outputs: {
    airSettings: {
      type: 'Data',
      label: 'Air Settings',
    },
  },
  params: {
    pressure: {
      type: 'number',
      label: 'Pressure',
      default: 20,
      min: 0,
      max: 100,
    },
    nozzleType: {
      type: 'enum',
      label: 'Nozzle Type',
      default: 'standard',
      options: ['standard', 'high-pressure', 'wide', 'focused'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'airAssist',
      params: {
        material: inputs.material,
        pressure: params.pressure,
        nozzleType: params.nozzleType,
      },
    });

    return {
      airSettings: result,
    };
  },
};
