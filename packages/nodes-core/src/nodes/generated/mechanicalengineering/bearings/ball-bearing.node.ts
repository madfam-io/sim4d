import type { NodeDefinition } from '@sim4d/types';

interface BallBearingParams {
  innerDiameter: number;
  outerDiameter: number;
  width: number;
  ballCount: number;
  showCage: boolean;
}

interface BallBearingInputs {
  center: [number, number, number];
  axis?: [number, number, number];
}

interface BallBearingOutputs {
  bearing: unknown;
  innerRace: unknown;
  outerRace: unknown;
}

export const MechanicalEngineeringBearingsBallBearingNode: NodeDefinition<
  BallBearingInputs,
  BallBearingOutputs,
  BallBearingParams
> = {
  id: 'MechanicalEngineering::BallBearing',
  category: 'MechanicalEngineering',
  label: 'BallBearing',
  description: 'Create ball bearing assembly',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
    axis: {
      type: 'Vector',
      label: 'Axis',
      optional: true,
    },
  },
  outputs: {
    bearing: {
      type: 'Shape',
      label: 'Bearing',
    },
    innerRace: {
      type: 'Shape',
      label: 'Inner Race',
    },
    outerRace: {
      type: 'Shape',
      label: 'Outer Race',
    },
  },
  params: {
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 20,
      min: 3,
      max: 200,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 47,
      min: 10,
      max: 400,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 14,
      min: 3,
      max: 100,
    },
    ballCount: {
      type: 'number',
      label: 'Ball Count',
      default: 8,
      min: 5,
      max: 20,
    },
    showCage: {
      type: 'boolean',
      label: 'Show Cage',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'ballBearing',
      params: {
        center: inputs.center,
        axis: inputs.axis,
        innerDiameter: params.innerDiameter,
        outerDiameter: params.outerDiameter,
        width: params.width,
        ballCount: params.ballCount,
        showCage: params.showCage,
      },
    });

    return {
      bearing: results.bearing,
      innerRace: results.innerRace,
      outerRace: results.outerRace,
    };
  },
};
