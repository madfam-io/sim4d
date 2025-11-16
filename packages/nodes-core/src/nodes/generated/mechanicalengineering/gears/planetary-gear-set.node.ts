import type { NodeDefinition } from '@brepflow/types';

interface PlanetaryGearSetParams {
  sunTeeth: number;
  planetTeeth: number;
  planetCount: number;
  module: number;
}

interface PlanetaryGearSetInputs {
  center: [number, number, number];
}

interface PlanetaryGearSetOutputs {
  assembly: unknown;
  sunGear: unknown;
  planetGears: unknown;
  ringGear: unknown;
}

export const MechanicalEngineeringGearsPlanetaryGearSetNode: NodeDefinition<
  PlanetaryGearSetInputs,
  PlanetaryGearSetOutputs,
  PlanetaryGearSetParams
> = {
  id: 'MechanicalEngineering::PlanetaryGearSet',
  category: 'MechanicalEngineering',
  label: 'PlanetaryGearSet',
  description: 'Create planetary gear system',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    assembly: {
      type: 'Shape',
      label: 'Assembly',
    },
    sunGear: {
      type: 'Shape',
      label: 'Sun Gear',
    },
    planetGears: {
      type: 'Shape[]',
      label: 'Planet Gears',
    },
    ringGear: {
      type: 'Shape',
      label: 'Ring Gear',
    },
  },
  params: {
    sunTeeth: {
      type: 'number',
      label: 'Sun Teeth',
      default: 20,
      min: 12,
      max: 40,
    },
    planetTeeth: {
      type: 'number',
      label: 'Planet Teeth',
      default: 16,
      min: 8,
      max: 30,
    },
    planetCount: {
      type: 'number',
      label: 'Planet Count',
      default: 3,
      min: 2,
      max: 6,
    },
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.5,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'planetaryGears',
      params: {
        center: inputs.center,
        sunTeeth: params.sunTeeth,
        planetTeeth: params.planetTeeth,
        planetCount: params.planetCount,
        module: params.module,
      },
    });

    return {
      assembly: results.assembly,
      sunGear: results.sunGear,
      planetGears: results.planetGears,
      ringGear: results.ringGear,
    };
  },
};
