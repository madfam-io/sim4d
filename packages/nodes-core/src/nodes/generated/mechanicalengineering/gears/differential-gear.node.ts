import type { NodeDefinition } from '@brepflow/types';

interface DifferentialGearParams {
  ringGearTeeth: number;
  pinionTeeth: number;
  spiderGearTeeth: number;
  module: number;
}

interface DifferentialGearInputs {
  housingCenter: [number, number, number];
}

interface DifferentialGearOutputs {
  assembly: unknown;
  housing: unknown;
  gears: unknown;
}

export const MechanicalEngineeringGearsDifferentialGearNode: NodeDefinition<
  DifferentialGearInputs,
  DifferentialGearOutputs,
  DifferentialGearParams
> = {
  id: 'MechanicalEngineering::DifferentialGear',
  category: 'MechanicalEngineering',
  label: 'DifferentialGear',
  description: 'Create differential gear assembly',
  inputs: {
    housingCenter: {
      type: 'Point',
      label: 'Housing Center',
      required: true,
    },
  },
  outputs: {
    assembly: {
      type: 'Shape',
      label: 'Assembly',
    },
    housing: {
      type: 'Shape',
      label: 'Housing',
    },
    gears: {
      type: 'Shape[]',
      label: 'Gears',
    },
  },
  params: {
    ringGearTeeth: {
      type: 'number',
      label: 'Ring Gear Teeth',
      default: 41,
      min: 30,
      max: 60,
    },
    pinionTeeth: {
      type: 'number',
      label: 'Pinion Teeth',
      default: 13,
      min: 9,
      max: 17,
    },
    spiderGearTeeth: {
      type: 'number',
      label: 'Spider Gear Teeth',
      default: 10,
      min: 8,
      max: 14,
    },
    module: {
      type: 'number',
      label: 'Module',
      default: 3,
      min: 2,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'differentialGear',
      params: {
        housingCenter: inputs.housingCenter,
        ringGearTeeth: params.ringGearTeeth,
        pinionTeeth: params.pinionTeeth,
        spiderGearTeeth: params.spiderGearTeeth,
        module: params.module,
      },
    });

    return {
      assembly: results.assembly,
      housing: results.housing,
      gears: results.gears,
    };
  },
};
