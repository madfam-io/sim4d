import type { NodeDefinition } from '@sim4d/types';

interface VehicleRampParams {
  gradient: number;
  width: number;
  transitionLength: number;
}

interface VehicleRampInputs {
  rampPath: unknown;
}

interface VehicleRampOutputs {
  vehicleRamp: unknown;
}

export const ArchitectureRampsVehicleRampNode: NodeDefinition<
  VehicleRampInputs,
  VehicleRampOutputs,
  VehicleRampParams
> = {
  id: 'Architecture::VehicleRamp',
  type: 'Architecture::VehicleRamp',
  category: 'Architecture',
  label: 'VehicleRamp',
  description: 'Vehicular access ramp',
  inputs: {
    rampPath: {
      type: 'Wire',
      label: 'Ramp Path',
      required: true,
    },
  },
  outputs: {
    vehicleRamp: {
      type: 'Shape',
      label: 'Vehicle Ramp',
    },
  },
  params: {
    gradient: {
      type: 'number',
      label: 'Gradient',
      default: 0.15,
      min: 0.1,
      max: 0.2,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 6000,
      min: 5000,
      max: 8000,
    },
    transitionLength: {
      type: 'number',
      label: 'Transition Length',
      default: 3000,
      min: 2000,
      max: 4000,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'vehicleRamp',
      params: {
        rampPath: inputs.rampPath,
        gradient: params.gradient,
        width: params.width,
        transitionLength: params.transitionLength,
      },
    });

    return {
      vehicleRamp: result,
    };
  },
};
