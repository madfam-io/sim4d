import type { NodeDefinition } from '@brepflow/types';

interface ClutchMechanismParams {
  type: string;
  outerDiameter: number;
  innerDiameter: number;
  plateCount: number;
}

interface ClutchMechanismInputs {
  center: [number, number, number];
}

interface ClutchMechanismOutputs {
  clutch: unknown;
  plates: unknown;
}

export const MechanicalEngineeringMechanismsClutchMechanismNode: NodeDefinition<
  ClutchMechanismInputs,
  ClutchMechanismOutputs,
  ClutchMechanismParams
> = {
  id: 'MechanicalEngineering::ClutchMechanism',
  category: 'MechanicalEngineering',
  label: 'ClutchMechanism',
  description: 'Create clutch assembly',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    clutch: {
      type: 'Shape',
      label: 'Clutch',
    },
    plates: {
      type: 'Shape[]',
      label: 'Plates',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'friction',
      options: ['friction', 'dog', 'centrifugal', 'electromagnetic'],
    },
    outerDiameter: {
      type: 'number',
      label: 'Outer Diameter',
      default: 100,
      min: 30,
      max: 300,
    },
    innerDiameter: {
      type: 'number',
      label: 'Inner Diameter',
      default: 50,
      min: 20,
      max: 150,
    },
    plateCount: {
      type: 'number',
      label: 'Plate Count',
      default: 3,
      min: 1,
      max: 8,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'clutchMechanism',
      params: {
        center: inputs.center,
        type: params.type,
        outerDiameter: params.outerDiameter,
        innerDiameter: params.innerDiameter,
        plateCount: params.plateCount,
      },
    });

    return {
      clutch: results.clutch,
      plates: results.plates,
    };
  },
};
