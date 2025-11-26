import type { NodeDefinition } from '@sim4d/types';

interface PulleySystemParams {
  driveDiameter: number;
  drivenDiameter: number;
  beltWidth: number;
  centerDistance: number;
}

interface PulleySystemInputs {
  driveCenter: [number, number, number];
  drivenCenter: [number, number, number];
}

interface PulleySystemOutputs {
  system: unknown;
  pulleys: unknown;
  belt: unknown;
}

export const MechanicalEngineeringPowerTransmissionPulleySystemNode: NodeDefinition<
  PulleySystemInputs,
  PulleySystemOutputs,
  PulleySystemParams
> = {
  id: 'MechanicalEngineering::PulleySystem',
  category: 'MechanicalEngineering',
  label: 'PulleySystem',
  description: 'Create pulley system',
  inputs: {
    driveCenter: {
      type: 'Point',
      label: 'Drive Center',
      required: true,
    },
    drivenCenter: {
      type: 'Point',
      label: 'Driven Center',
      required: true,
    },
  },
  outputs: {
    system: {
      type: 'Shape',
      label: 'System',
    },
    pulleys: {
      type: 'Shape[]',
      label: 'Pulleys',
    },
    belt: {
      type: 'Shape',
      label: 'Belt',
    },
  },
  params: {
    driveDiameter: {
      type: 'number',
      label: 'Drive Diameter',
      default: 100,
      min: 20,
      max: 500,
    },
    drivenDiameter: {
      type: 'number',
      label: 'Driven Diameter',
      default: 200,
      min: 20,
      max: 500,
    },
    beltWidth: {
      type: 'number',
      label: 'Belt Width',
      default: 20,
      min: 5,
      max: 100,
    },
    centerDistance: {
      type: 'number',
      label: 'Center Distance',
      default: 300,
      min: 100,
      max: 1000,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'pulleySystem',
      params: {
        driveCenter: inputs.driveCenter,
        drivenCenter: inputs.drivenCenter,
        driveDiameter: params.driveDiameter,
        drivenDiameter: params.drivenDiameter,
        beltWidth: params.beltWidth,
        centerDistance: params.centerDistance,
      },
    });

    return {
      system: results.system,
      pulleys: results.pulleys,
      belt: results.belt,
    };
  },
};
