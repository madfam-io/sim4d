import { NodeDefinition } from '@sim4d/types';

interface Params {
  driveDiameter: number;
  drivenDiameter: number;
  beltWidth: number;
  centerDistance: number;
}
interface Inputs {
  driveCenter: Point;
  drivenCenter: Point;
}
interface Outputs {
  system: Shape;
  pulleys: Shape[];
  belt: Shape;
}

export const PulleySystemNode: NodeDefinition<
  PulleySystemInputs,
  PulleySystemOutputs,
  PulleySystemParams
> = {
  type: 'MechanicalEngineering::PulleySystem',
  category: 'MechanicalEngineering',
  subcategory: 'PowerTransmission',

  metadata: {
    label: 'PulleySystem',
    description: 'Create pulley system',
  },

  params: {
    driveDiameter: {
      default: 100,
      min: 20,
      max: 500,
    },
    drivenDiameter: {
      default: 200,
      min: 20,
      max: 500,
    },
    beltWidth: {
      default: 20,
      min: 5,
      max: 100,
    },
    centerDistance: {
      default: 300,
      min: 100,
      max: 1000,
    },
  },

  inputs: {
    driveCenter: 'Point',
    drivenCenter: 'Point',
  },

  outputs: {
    system: 'Shape',
    pulleys: 'Shape[]',
    belt: 'Shape',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      system: result,
      pulleys: result,
      belt: result,
    };
  },
};
