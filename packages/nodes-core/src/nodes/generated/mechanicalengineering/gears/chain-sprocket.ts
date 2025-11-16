import type { NodeDefinition } from '@brepflow/types';

interface ChainSprocketParams {
  chainPitch: number;
  teeth: number;
  rollerDiameter: number;
  width: number;
}

interface ChainSprocketInputs {
  center: [number, number, number];
}

interface ChainSprocketOutputs {
  sprocket: unknown;
  pitchCircle: unknown;
}

export const MechanicalEngineeringGearsChainSprocketNode: NodeDefinition<
  ChainSprocketInputs,
  ChainSprocketOutputs,
  ChainSprocketParams
> = {
  id: 'MechanicalEngineering::ChainSprocket',
  type: 'MechanicalEngineering::ChainSprocket',
  category: 'MechanicalEngineering',
  label: 'ChainSprocket',
  description: 'Create chain drive sprocket',
  inputs: {
    center: {
      type: 'Point',
      label: 'Center',
      required: true,
    },
  },
  outputs: {
    sprocket: {
      type: 'Shape',
      label: 'Sprocket',
    },
    pitchCircle: {
      type: 'Wire',
      label: 'Pitch Circle',
    },
  },
  params: {
    chainPitch: {
      type: 'number',
      label: 'Chain Pitch',
      default: 12.7,
      min: 6,
      max: 50,
    },
    teeth: {
      type: 'number',
      label: 'Teeth',
      default: 18,
      min: 9,
      max: 100,
    },
    rollerDiameter: {
      type: 'number',
      label: 'Roller Diameter',
      default: 7.92,
      min: 3,
      max: 30,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 7.85,
      min: 3,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'chainSprocket',
      params: {
        center: inputs.center,
        chainPitch: params.chainPitch,
        teeth: params.teeth,
        rollerDiameter: params.rollerDiameter,
        width: params.width,
      },
    });

    return {
      sprocket: results.sprocket,
      pitchCircle: results.pitchCircle,
    };
  },
};
