import type { NodeDefinition } from '@brepflow/types';

interface SphericalBearingParams {
  ballDiameter: number;
  boreDiameter: number;
  housingDiameter: number;
  misalignmentAngle: number;
}

interface SphericalBearingInputs {
  center: [number, number, number];
}

interface SphericalBearingOutputs {
  bearing: unknown;
  ball: unknown;
  housing: unknown;
}

export const MechanicalEngineeringBearingsSphericalBearingNode: NodeDefinition<
  SphericalBearingInputs,
  SphericalBearingOutputs,
  SphericalBearingParams
> = {
  id: 'MechanicalEngineering::SphericalBearing',
  type: 'MechanicalEngineering::SphericalBearing',
  category: 'MechanicalEngineering',
  label: 'SphericalBearing',
  description: 'Create spherical bearing for misalignment',
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
    ball: {
      type: 'Shape',
      label: 'Ball',
    },
    housing: {
      type: 'Shape',
      label: 'Housing',
    },
  },
  params: {
    ballDiameter: {
      type: 'number',
      label: 'Ball Diameter',
      default: 20,
      min: 5,
      max: 100,
    },
    boreDiameter: {
      type: 'number',
      label: 'Bore Diameter',
      default: 8,
      min: 3,
      max: 50,
    },
    housingDiameter: {
      type: 'number',
      label: 'Housing Diameter',
      default: 30,
      min: 10,
      max: 150,
    },
    misalignmentAngle: {
      type: 'number',
      label: 'Misalignment Angle',
      default: 15,
      min: 5,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'sphericalBearing',
      params: {
        center: inputs.center,
        ballDiameter: params.ballDiameter,
        boreDiameter: params.boreDiameter,
        housingDiameter: params.housingDiameter,
        misalignmentAngle: params.misalignmentAngle,
      },
    });

    return {
      bearing: results.bearing,
      ball: results.ball,
      housing: results.housing,
    };
  },
};
