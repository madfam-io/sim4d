import type { NodeDefinition } from '@sim4d/types';

interface ChainDriveParams {
  driveTeeth: number;
  drivenTeeth: number;
  chainPitch: number;
  chainRows: number;
}

interface ChainDriveInputs {
  sprocket1Center: [number, number, number];
  sprocket2Center: [number, number, number];
}

interface ChainDriveOutputs {
  system: unknown;
  sprockets: unknown;
  chain: unknown;
}

export const MechanicalEngineeringPowerTransmissionChainDriveNode: NodeDefinition<
  ChainDriveInputs,
  ChainDriveOutputs,
  ChainDriveParams
> = {
  id: 'MechanicalEngineering::ChainDrive',
  category: 'MechanicalEngineering',
  label: 'ChainDrive',
  description: 'Create chain drive system',
  inputs: {
    sprocket1Center: {
      type: 'Point',
      label: 'Sprocket1 Center',
      required: true,
    },
    sprocket2Center: {
      type: 'Point',
      label: 'Sprocket2 Center',
      required: true,
    },
  },
  outputs: {
    system: {
      type: 'Shape',
      label: 'System',
    },
    sprockets: {
      type: 'Shape[]',
      label: 'Sprockets',
    },
    chain: {
      type: 'Shape',
      label: 'Chain',
    },
  },
  params: {
    driveTeeth: {
      type: 'number',
      label: 'Drive Teeth',
      default: 17,
      min: 9,
      max: 50,
    },
    drivenTeeth: {
      type: 'number',
      label: 'Driven Teeth',
      default: 42,
      min: 15,
      max: 120,
    },
    chainPitch: {
      type: 'number',
      label: 'Chain Pitch',
      default: 12.7,
      min: 6,
      max: 25.4,
    },
    chainRows: {
      type: 'number',
      label: 'Chain Rows',
      default: 1,
      min: 1,
      max: 3,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'chainDrive',
      params: {
        sprocket1Center: inputs.sprocket1Center,
        sprocket2Center: inputs.sprocket2Center,
        driveTeeth: params.driveTeeth,
        drivenTeeth: params.drivenTeeth,
        chainPitch: params.chainPitch,
        chainRows: params.chainRows,
      },
    });

    return {
      system: results.system,
      sprockets: results.sprockets,
      chain: results.chain,
    };
  },
};
