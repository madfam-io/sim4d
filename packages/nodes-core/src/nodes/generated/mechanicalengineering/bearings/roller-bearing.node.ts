import type { NodeDefinition } from '@sim4d/types';

interface RollerBearingParams {
  innerDiameter: number;
  outerDiameter: number;
  width: number;
  rollerType: string;
}

interface RollerBearingInputs {
  center: [number, number, number];
}

interface RollerBearingOutputs {
  bearing: unknown;
  rollers: unknown;
}

export const MechanicalEngineeringBearingsRollerBearingNode: NodeDefinition<
  RollerBearingInputs,
  RollerBearingOutputs,
  RollerBearingParams
> = {
  id: 'MechanicalEngineering::RollerBearing',
  category: 'MechanicalEngineering',
  label: 'RollerBearing',
  description: 'Create roller bearing',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    bearing: {
      type: 'Shape',
      label: 'Bearing',
    },
    rollers: {
      type: 'Shape[]',
      label: 'Rollers',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 25,
      min: 5,
      max: 200,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 52,
      min: 15,
      max: 400,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 15,
      min: 5,
      max: 100,
    },
    rollerType: {
      type: 'enum',
      label: 'Roller Type',
      default: 'cylindrical',
      options: ['cylindrical', 'tapered', 'spherical'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rollerBearing',
      params: {
        center: inputs.center,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        width: params.width,
        rollerType: params.rollerType,
      },
    });

    return {
      bearing: results.bearing,
      rollers: results.rollers,
    };
  },
};
