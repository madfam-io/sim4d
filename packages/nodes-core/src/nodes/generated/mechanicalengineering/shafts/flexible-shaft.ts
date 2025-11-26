import type { NodeDefinition } from '@sim4d/types';

interface FlexibleShaftParams {
  coreDiameter: number;
  outerDiameter: number;
  length: number;
  windingAngle: number;
}

interface FlexibleShaftInputs {
  path: unknown;
}

interface FlexibleShaftOutputs {
  shaft: unknown;
  centerline: unknown;
}

export const MechanicalEngineeringShaftsFlexibleShaftNode: NodeDefinition<
  FlexibleShaftInputs,
  FlexibleShaftOutputs,
  FlexibleShaftParams
> = {
  id: 'MechanicalEngineering::FlexibleShaft',
  type: 'MechanicalEngineering::FlexibleShaft',
  category: 'MechanicalEngineering',
  label: 'FlexibleShaft',
  description: 'Create flexible shaft design',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    shaft: {
      type: 'Shape',
      label: 'Shaft',
    },
    centerline: {
      type: 'Wire',
      label: 'Centerline',
    },
  },
  params: {
    coreDiameter: {
      type: 'number',
      label: 'Core Diameter',
      default: 5,
      min: 2,
      max: 20,
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 8,
      min: 4,
      max: 30,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 300,
      min: 100,
      max: 1000,
    },
    windingAngle: {
      type: 'number',
      label: 'Winding Angle',
      default: 45,
      min: 30,
      max: 60,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'flexibleShaft',
      params: {
        path: inputs.path,
        coreDiameter: params.coreDiameter,
        outerDiameter: params.outerDiameter,
        length: params.length,
        windingAngle: params.windingAngle,
      },
    });

    return {
      shaft: results.shaft,
      centerline: results.centerline,
    };
  },
};
