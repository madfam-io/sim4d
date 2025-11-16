import type { NodeDefinition } from '@brepflow/types';

interface FluidDomainParams {
  domainType: string;
  boundingBoxScale: [number, number, number];
  refinementDistance: number;
}

interface FluidDomainInputs {
  geometry: unknown;
}

interface FluidDomainOutputs {
  fluidDomain: unknown;
  walls: unknown;
}

export const SimulationCFDFluidDomainNode: NodeDefinition<
  FluidDomainInputs,
  FluidDomainOutputs,
  FluidDomainParams
> = {
  id: 'Simulation::FluidDomain',
  type: 'Simulation::FluidDomain',
  category: 'Simulation',
  label: 'FluidDomain',
  description: 'Create fluid domain',
  inputs: {
    geometry: {
      type: 'Shape',
      label: 'Geometry',
      required: true,
    },
  },
  outputs: {
    fluidDomain: {
      type: 'Shape',
      label: 'Fluid Domain',
    },
    walls: {
      type: 'Face[]',
      label: 'Walls',
    },
  },
  params: {
    domainType: {
      type: 'enum',
      label: 'Domain Type',
      default: 'external',
      options: ['internal', 'external', 'both'],
    },
    boundingBoxScale: {
      type: 'vec3',
      label: 'Bounding Box Scale',
      default: [3, 3, 3],
    },
    refinementDistance: {
      type: 'number',
      label: 'Refinement Distance',
      default: 10,
      min: 1,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'fluidDomain',
      params: {
        geometry: inputs.geometry,
        domainType: params.domainType,
        boundingBoxScale: params.boundingBoxScale,
        refinementDistance: params.refinementDistance,
      },
    });

    return {
      fluidDomain: results.fluidDomain,
      walls: results.walls,
    };
  },
};
