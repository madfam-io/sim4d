import type { NodeDefinition } from '@brepflow/types';

interface FluidPropertiesParams {
  fluid: string;
  density: number;
  viscosity: number;
  compressible: boolean;
}

interface FluidPropertiesInputs {
  domain: unknown;
}

interface FluidPropertiesOutputs {
  fluidDomain: unknown;
  fluidData: unknown;
}

export const SimulationCFDFluidPropertiesNode: NodeDefinition<
  FluidPropertiesInputs,
  FluidPropertiesOutputs,
  FluidPropertiesParams
> = {
  id: 'Simulation::FluidProperties',
  type: 'Simulation::FluidProperties',
  category: 'Simulation',
  label: 'FluidProperties',
  description: 'Set fluid properties',
  inputs: {
    domain: {
      type: 'Shape',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    fluidDomain: {
      type: 'Shape',
      label: 'Fluid Domain',
    },
    fluidData: {
      type: 'Data',
      label: 'Fluid Data',
    },
  },
  params: {
    fluid: {
      type: 'enum',
      label: 'Fluid',
      default: 'air',
      options: ['air', 'water', 'oil', 'custom'],
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 1.225,
      min: 0.001,
      max: 20000,
    },
    viscosity: {
      type: 'number',
      label: 'Viscosity',
      default: 0.0000181,
      min: 1e-10,
      max: 100,
    },
    compressible: {
      type: 'boolean',
      label: 'Compressible',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fluidProperties',
      params: {
        domain: inputs.domain,
        fluid: params.fluid,
        density: params.density,
        viscosity: params.viscosity,
        compressible: params.compressible,
      },
    });

    return {
      fluidDomain: results.fluidDomain,
      fluidData: results.fluidData,
    };
  },
};
