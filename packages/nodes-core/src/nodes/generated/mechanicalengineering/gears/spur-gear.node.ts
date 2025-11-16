import type { NodeDefinition } from '@brepflow/types';

interface SpurGearParams {
  module: number;
  teeth: number;
  pressureAngle: number;
  width: number;
  hubDiameter: number;
}

interface SpurGearInputs {
  center?: [number, number, number];
  axis?: [number, number, number];
}

interface SpurGearOutputs {
  gear: unknown;
  pitchCircle: unknown;
  properties: unknown;
}

export const MechanicalEngineeringGearsSpurGearNode: NodeDefinition<
  SpurGearInputs,
  SpurGearOutputs,
  SpurGearParams
> = {
  id: 'MechanicalEngineering::SpurGear',
  category: 'MechanicalEngineering',
  label: 'SpurGear',
  description: 'Create standard spur gear',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
    axis: {
      type: 'Vector',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    gear: {
      type: 'Shape',
      label: 'Gear',
    },
    pitchCircle: {
      type: 'Wire',
      label: 'Pitch Circle',
    },
    properties: {
      type: 'Properties',
      label: 'Properties',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.5,
      max: 20,
      step: 0.1,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 20,
      min: 6,
      max: 200,
    },
    pressureAngle: {
      type: 'number',
      label: 'Pressure Angle',
      default: 20,
      min: 14.5,
      max: 25,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 1,
      max: 200,
    },
    hubDiameter: {
      type: 'number',
      label: 'Hub Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'spurGear',
      params: {
        center: inputs.center,
        axis: inputs.axis,
        module: params.module,
        teeth: params.teeth,
        pressureAngle: params.pressureAngle,
        width: params.width,
        hubDiameter: params.hubDiameter,
      },
    });

    return {
      gear: results.gear,
      pitchCircle: results.pitchCircle,
      properties: results.properties,
    };
  },
};
