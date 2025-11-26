import type { NodeDefinition } from '@sim4d/types';

interface InternalGearParams {
  module: number;
  teeth: number;
  rimThickness: number;
  width: number;
}

interface InternalGearInputs {
  center: [number, number, number];
}

interface InternalGearOutputs {
  gear: unknown;
  innerProfile: unknown;
}

export const MechanicalEngineeringGearsInternalGearNode: NodeDefinition<
  InternalGearInputs,
  InternalGearOutputs,
  InternalGearParams
> = {
  id: 'MechanicalEngineering::InternalGear',
  type: 'MechanicalEngineering::InternalGear',
  category: 'MechanicalEngineering',
  label: 'InternalGear',
  description: 'Create internal/ring gear',
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
    innerProfile: {
      type: 'Wire',
      label: 'Inner Profile',
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
      default: 60,
      min: 30,
      max: 200,
    },
    rimThickness: {
      type: 'number',
      label: 'Rim Thickness',
      default: 10,
      min: 5,
      max: 30,
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
      type: 'internalGear',
      params: {
        center: inputs.center,
        module: params.module,
        teeth: params.teeth,
        rimThickness: params.rimThickness,
        width: params.width,
      },
    });

    return {
      gear: results.gear,
      innerProfile: results.innerProfile,
    };
  },
};
