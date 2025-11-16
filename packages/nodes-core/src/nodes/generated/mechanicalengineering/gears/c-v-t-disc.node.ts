import { NodeDefinition } from '@brepflow/types';

interface Params {
  minDiameter: number;
  maxDiameter: number;
  coneAngle: number;
  shaftDiameter: number;
}
interface Inputs {
  center: Point;
}
interface Outputs {
  disc: Shape;
  contactSurface: Surface;
}

export const CVTDiscNode: NodeDefinition<CVTDiscInputs, CVTDiscOutputs, CVTDiscParams> = {
  type: 'MechanicalEngineering::CVTDisc',
  category: 'MechanicalEngineering',
  subcategory: 'Gears',

  metadata: {
    label: 'CVTDisc',
    description: 'Create CVT transmission disc',
  },

  params: {
    minDiameter: {
      default: 30,
      min: 20,
      max: 100,
    },
    maxDiameter: {
      default: 100,
      min: 50,
      max: 300,
    },
    coneAngle: {
      default: 11,
      min: 8,
      max: 15,
    },
    shaftDiameter: {
      default: 20,
      min: 10,
      max: 50,
    },
  },

  inputs: {
    center: 'Point',
  },

  outputs: {
    disc: 'Shape',
    contactSurface: 'Surface',
  },

  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
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
      disc: result,
      contactSurface: result,
    };
  },
};
