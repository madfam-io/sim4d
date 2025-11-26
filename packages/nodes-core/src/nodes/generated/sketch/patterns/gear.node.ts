import type { NodeDefinition } from '@sim4d/types';

interface GearParams {
  teeth: number;
  module: number;
  pressureAngle: number;
  addendum: number;
  dedendum: number;
}

interface GearInputs {
  center?: [number, number, number];
}

interface GearOutputs {
  gear: unknown;
}

export const SketchPatternsGearNode: NodeDefinition<GearInputs, GearOutputs, GearParams> = {
  id: 'Sketch::Gear',
  category: 'Sketch',
  label: 'Gear',
  description: 'Create a gear profile',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      optional: true,
    },
  },
  outputs: {
    gear: {
      type: 'Wire',
      label: 'Gear',
    },
  },
  params: {
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 20,
      min: 3,
      max: 200,
      step: 1,
    },
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.1,
      max: 100,
    },
    pressureAngle: {
      type: 'number',
      label: 'Pressure Angle',
      default: 20,
      min: 14.5,
      max: 30,
    },
    addendum: {
      type: 'number',
      label: 'Addendum',
      default: 1,
      min: 0.5,
      max: 1.5,
    },
    dedendum: {
      type: 'number',
      label: 'Dedendum',
      default: 1.25,
      min: 1,
      max: 2,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'makeGear',
      params: {
        center: inputs.center,
        teeth: params.teeth,
        module: params.module,
        pressureAngle: params.pressureAngle,
        addendum: params.addendum,
        dedendum: params.dedendum,
      },
    });

    return {
      gear: result,
    };
  },
};
