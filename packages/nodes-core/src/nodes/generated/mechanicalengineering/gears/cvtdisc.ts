import type { NodeDefinition } from '@brepflow/types';

interface CVTDiscParams {
  minDiameter: number;
  maxDiameter: number;
  coneAngle: number;
  shaftDiameter: number;
}

interface CVTDiscInputs {
  center: [number, number, number];
}

interface CVTDiscOutputs {
  disc: unknown;
  contactSurface: unknown;
}

export const MechanicalEngineeringGearsCVTDiscNode: NodeDefinition<
  CVTDiscInputs,
  CVTDiscOutputs,
  CVTDiscParams
> = {
  id: 'MechanicalEngineering::CVTDisc',
  type: 'MechanicalEngineering::CVTDisc',
  category: 'MechanicalEngineering',
  label: 'CVTDisc',
  description: 'Create CVT transmission disc',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    disc: {
      type: 'Shape',
      label: 'Disc',
    },
    contactSurface: {
      type: 'Surface',
      label: 'Contact Surface',
    },
  },
  params: {
    minDiameter: {
      type: 'number',
      label: 'Min Diameter',
      default: 30,
      min: 20,
      max: 100,
    },
    maxDiameter: {
      type: 'number',
      label: 'Max Diameter',
      default: 100,
      min: 50,
      max: 300,
    },
    coneAngle: {
      type: 'number',
      label: 'Cone Angle',
      default: 11,
      min: 8,
      max: 15,
    },
    shaftDiameter: {
      type: 'number',
      label: 'Shaft Diameter',
      default: 20,
      min: 10,
      max: 50,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'cvtDisc',
      params: {
        center: inputs.center,
        minDiameter: params.minDiameter,
        maxDiameter: params.maxDiameter,
        coneAngle: params.coneAngle,
        shaftDiameter: params.shaftDiameter,
      },
    });

    return {
      disc: results.disc,
      contactSurface: results.contactSurface,
    };
  },
};
