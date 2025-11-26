import type { NodeDefinition } from '@sim4d/types';

interface TorsionSpringParams {
  wireDiameter: number;
  coilDiameter: number;
  coils: number;
  legLength: number;
  legAngle: number;
}

interface TorsionSpringInputs {
  center: [number, number, number];
}

interface TorsionSpringOutputs {
  spring: unknown;
  legs: unknown;
}

export const MechanicalEngineeringSpringsTorsionSpringNode: NodeDefinition<
  TorsionSpringInputs,
  TorsionSpringOutputs,
  TorsionSpringParams
> = {
  id: 'MechanicalEngineering::TorsionSpring',
  type: 'MechanicalEngineering::TorsionSpring',
  category: 'MechanicalEngineering',
  label: 'TorsionSpring',
  description: 'Create torsion spring',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    spring: {
      type: 'Shape',
      label: 'Spring',
    },
    legs: {
      type: 'Wire[]',
      label: 'Legs',
    },
  },
  params: {
    wireDiameter: {
      type: 'number',
      label: 'Wire Diameter',
      default: 2,
      min: 0.5,
      max: 8,
    },
    coilDiameter: {
      type: 'number',
      label: 'Coil Diameter',
      default: 20,
      min: 5,
      max: 80,
    },
    coils: {
      type: 'number',
      label: 'Coils',
      default: 5,
      min: 2,
      max: 20,
    },
    legLength: {
      type: 'number',
      label: 'Leg Length',
      default: 30,
      min: 10,
      max: 100,
    },
    legAngle: {
      type: 'number',
      label: 'Leg Angle',
      default: 90,
      min: 0,
      max: 180,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'torsionSpring',
      params: {
        center: inputs.center,
        wireDiameter: params.wireDiameter,
        coilDiameter: params.coilDiameter,
        coils: params.coils,
        legLength: params.legLength,
        legAngle: params.legAngle,
      },
    });

    return {
      spring: results.spring,
      legs: results.legs,
    };
  },
};
