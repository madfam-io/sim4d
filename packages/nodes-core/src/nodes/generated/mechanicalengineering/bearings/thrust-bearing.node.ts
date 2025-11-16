import type { NodeDefinition } from '@brepflow/types';

interface ThrustBearingParams {
  innerDiameter: number;
  outerDiameter: number;
  height: number;
  type: string;
}

interface ThrustBearingInputs {
  center: [number, number, number];
}

interface ThrustBearingOutputs {
  bearing: unknown;
  raceways: unknown;
}

export const MechanicalEngineeringBearingsThrustBearingNode: NodeDefinition<
  ThrustBearingInputs,
  ThrustBearingOutputs,
  ThrustBearingParams
> = {
  id: 'MechanicalEngineering::ThrustBearing',
  category: 'MechanicalEngineering',
  label: 'ThrustBearing',
  description: 'Create thrust bearing for axial loads',
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
    raceways: {
      type: 'Shape[]',
      label: 'Raceways',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 20,
      min: 5,
      max: 150,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 40,
      min: 15,
      max: 300,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 10,
      min: 3,
      max: 50,
    },
    type: {
      type: 'enum',
      label: 'Type',
      default: 'ball',
      options: ['ball', 'roller', 'needle'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'thrustBearing',
      params: {
        center: inputs.center,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        height: params.height,
        type: params.type,
      },
    });

    return {
      bearing: results.bearing,
      raceways: results.raceways,
    };
  },
};
