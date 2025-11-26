import type { NodeDefinition } from '@sim4d/types';

interface BevelGearParams {
  module: number;
  teeth: number;
  coneAngle: number;
  faceWidth: number;
}

interface BevelGearInputs {
  apex: [number, number, number];
}

interface BevelGearOutputs {
  gear: unknown;
  pitchCone: unknown;
}

export const MechanicalEngineeringGearsBevelGearNode: NodeDefinition<
  BevelGearInputs,
  BevelGearOutputs,
  BevelGearParams
> = {
  id: 'MechanicalEngineering::BevelGear',
  category: 'MechanicalEngineering',
  label: 'BevelGear',
  description: 'Create bevel gear for angle transmission',
  inputs: {
    apex: {
      type: 'Point',
      label: 'Apex',
      required: true,
    },
  },
  outputs: {
    gear: {
      type: 'Shape',
      label: 'Gear',
    },
    pitchCone: {
      type: 'Surface',
      label: 'Pitch Cone',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 3,
      min: 1,
      max: 20,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 25,
      min: 10,
      max: 100,
    },
    coneAngle: {
      type: 'number',
      label: 'Cone Angle',
      default: 45,
      min: 10,
      max: 80,
    },
    faceWidth: {
      type: 'number',
      label: 'Face Width',
      default: 15,
      min: 5,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'bevelGear',
      params: {
        apex: inputs.apex,
        module: params.module,
        teeth: params.teeth,
        coneAngle: params.coneAngle,
        faceWidth: params.faceWidth,
      },
    });

    return {
      gear: results.gear,
      pitchCone: results.pitchCone,
    };
  },
};
