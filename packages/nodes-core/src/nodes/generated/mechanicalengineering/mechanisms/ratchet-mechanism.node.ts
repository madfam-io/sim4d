import type { NodeDefinition } from '@sim4d/types';

interface RatchetMechanismParams {
  wheelDiameter: number;
  teeth: number;
  pawlLength: number;
  springTension: number;
}

interface RatchetMechanismInputs {
  center: [number, number, number];
}

interface RatchetMechanismOutputs {
  assembly: unknown;
  wheel: unknown;
  pawl: unknown;
}

export const MechanicalEngineeringMechanismsRatchetMechanismNode: NodeDefinition<
  RatchetMechanismInputs,
  RatchetMechanismOutputs,
  RatchetMechanismParams
> = {
  id: 'MechanicalEngineering::RatchetMechanism',
  category: 'MechanicalEngineering',
  label: 'RatchetMechanism',
  description: 'Create ratchet and pawl',
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
    wheel: {
      type: 'Shape',
      label: 'Wheel',
    },
    pawl: {
      type: 'Shape',
      label: 'Pawl',
    },
  },
  params: {
    wheelDiameter: {
      type: 'number',
      label: 'Wheel Diameter',
      default: 50,
      min: 20,
      max: 150,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 24,
      min: 12,
      max: 60,
    },
    pawlLength: {
      type: 'number',
      label: 'Pawl Length',
      default: 20,
      min: 10,
      max: 50,
    },
    springTension: {
      type: 'number',
      label: 'Spring Tension',
      default: 5,
      min: 1,
      max: 20,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'ratchetMechanism',
      params: {
        center: inputs.center,
        wheelDiameter: params.wheelDiameter,
        teeth: params.teeth,
        pawlLength: params.pawlLength,
        springTension: params.springTension,
      },
    });

    return {
      assembly: results.assembly,
      wheel: results.wheel,
      pawl: results.pawl,
    };
  },
};
