import type { NodeDefinition } from '@brepflow/types';

interface WormGearParams {
  module: number;
  teeth: number;
  diameter: number;
  width: number;
}

interface WormGearInputs {
  center: [number, number, number];
}

interface WormGearOutputs {
  gear: unknown;
  throat: unknown;
}

export const MechanicalEngineeringGearsWormGearNode: NodeDefinition<
  WormGearInputs,
  WormGearOutputs,
  WormGearParams
> = {
  id: 'MechanicalEngineering::WormGear',
  category: 'MechanicalEngineering',
  label: 'WormGear',
  description: 'Create worm gear for high reduction',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    gear: {
      type: 'Shape',
      label: 'Gear',
    },
    throat: {
      type: 'Wire',
      label: 'Throat',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.5,
      max: 10,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 30,
      min: 20,
      max: 100,
    },
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 60,
      min: 20,
      max: 200,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 5,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'wormGear',
      params: {
        center: inputs.center,
        module: params.module,
        teeth: params.teeth,
        diameter: params.diameter,
        width: params.width,
      },
    });

    return {
      gear: results.gear,
      throat: results.throat,
    };
  },
};
