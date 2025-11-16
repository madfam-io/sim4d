import type { NodeDefinition } from '@brepflow/types';

interface FluidCouplingParams {
  impellerDiameter: number;
  housingDiameter: number;
  vaneCount: number;
  fluidCapacity: number;
}

interface FluidCouplingInputs {
  center: [number, number, number];
}

interface FluidCouplingOutputs {
  coupling: unknown;
  impeller: unknown;
  turbine: unknown;
}

export const MechanicalEngineeringCouplingsFluidCouplingNode: NodeDefinition<
  FluidCouplingInputs,
  FluidCouplingOutputs,
  FluidCouplingParams
> = {
  id: 'MechanicalEngineering::FluidCoupling',
  type: 'MechanicalEngineering::FluidCoupling',
  category: 'MechanicalEngineering',
  label: 'FluidCoupling',
  description: 'Create fluid coupling design',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    coupling: {
      type: 'Shape',
      label: 'Coupling',
    },
    impeller: {
      type: 'Shape',
      label: 'Impeller',
    },
    turbine: {
      type: 'Shape',
      label: 'Turbine',
    },
  },
  params: {
    impellerDiameter: {
      type: 'number',
      label: 'Impeller Diameter',
      default: 150,
      min: 50,
      max: 500,
    },
    housingDiameter: {
      type: 'number',
      label: 'Housing Diameter',
      default: 180,
      min: 60,
      max: 600,
    },
    vaneCount: {
      type: 'number',
      label: 'Vane Count',
      default: 32,
      min: 16,
      max: 64,
    },
    fluidCapacity: {
      type: 'number',
      label: 'Fluid Capacity',
      default: 2,
      min: 0.5,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fluidCoupling',
      params: {
        center: inputs.center,
        impellerDiameter: params.impellerDiameter,
        housingDiameter: params.housingDiameter,
        vaneCount: params.vaneCount,
        fluidCapacity: params.fluidCapacity,
      },
    });

    return {
      coupling: results.coupling,
      impeller: results.impeller,
      turbine: results.turbine,
    };
  },
};
