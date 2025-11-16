import type { NodeDefinition } from '@brepflow/types';

interface SplinedShaftParams {
  majorDiameter: number;
  minorDiameter: number;
  splineCount: number;
  length: number;
}

interface SplinedShaftInputs {
  center: [number, number, number];
}

interface SplinedShaftOutputs {
  shaft: unknown;
  splines: unknown;
}

export const MechanicalEngineeringShaftsSplinedShaftNode: NodeDefinition<
  SplinedShaftInputs,
  SplinedShaftOutputs,
  SplinedShaftParams
> = {
  id: 'MechanicalEngineering::SplinedShaft',
  category: 'MechanicalEngineering',
  label: 'SplinedShaft',
  description: 'Create splined shaft',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    shaft: {
      type: 'Shape',
      label: 'Shaft',
    },
    splines: {
      type: 'Wire[]',
      label: 'Splines',
    },
  },
  params: {
    majorDiameter: {
      type: 'number',
      label: 'Major Diameter',
      default: 25,
      min: 10,
      max: 100,
    },
    minorDiameter: {
      type: 'number',
      label: 'Minor Diameter',
      default: 22,
      min: 8,
      max: 95,
    },
    splineCount: {
      type: 'number',
      label: 'Spline Count',
      default: 6,
      min: 4,
      max: 20,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 50,
      min: 10,
      max: 200,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'splinedShaft',
      params: {
        center: inputs.center,
        majorDiameter: params.majorDiameter,
        minorDiameter: params.minorDiameter,
        splineCount: params.splineCount,
        length: params.length,
      },
    });

    return {
      shaft: results.shaft,
      splines: results.splines,
    };
  },
};
