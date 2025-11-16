import type { NodeDefinition } from '@brepflow/types';

interface AirBearingParams {
  diameter: number;
  thickness: number;
  pocketCount: number;
  restrictorType: string;
}

interface AirBearingInputs {
  center: [number, number, number];
}

interface AirBearingOutputs {
  bearing: unknown;
  pockets: unknown;
  restrictors: unknown;
}

export const MechanicalEngineeringBearingsAirBearingNode: NodeDefinition<
  AirBearingInputs,
  AirBearingOutputs,
  AirBearingParams
> = {
  id: 'MechanicalEngineering::AirBearing',
  category: 'MechanicalEngineering',
  label: 'AirBearing',
  description: 'Create air bearing design',
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
    pockets: {
      type: 'Face[]',
      label: 'Pockets',
    },
    restrictors: {
      type: 'Wire[]',
      label: 'Restrictors',
    },
  },
  params: {
    diameter: {
      type: 'number',
      label: 'Diameter',
      default: 50,
      min: 20,
      max: 200,
    },
    thickness: {
      type: 'number',
      label: 'Thickness',
      default: 10,
      min: 5,
      max: 30,
    },
    pocketCount: {
      type: 'number',
      label: 'Pocket Count',
      default: 6,
      min: 3,
      max: 12,
    },
    restrictorType: {
      type: 'enum',
      label: 'Restrictor Type',
      default: 'orifice',
      options: ['orifice', 'porous', 'groove'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'airBearing',
      params: {
        center: inputs.center,
        diameter: params.diameter,
        thickness: params.thickness,
        pocketCount: params.pocketCount,
        restrictorType: params.restrictorType,
      },
    });

    return {
      bearing: results.bearing,
      pockets: results.pockets,
      restrictors: results.restrictors,
    };
  },
};
