import { NodeDefinition } from '@brepflow/types';

interface Params {
  driveTeeth: number;
  drivenTeeth: number;
  chainPitch: number;
  chainRows: number;
}
interface Inputs {
  sprocket1Center: Point;
  sprocket2Center: Point;
}
interface Outputs {
  system: Shape;
  sprockets: Shape[];
  chain: Shape;
}

export const ChainDriveNode: NodeDefinition<ChainDriveInputs, ChainDriveOutputs, ChainDriveParams> =
  {
    type: 'MechanicalEngineering::ChainDrive',
    category: 'MechanicalEngineering',
    subcategory: 'PowerTransmission',

    metadata: {
      label: 'ChainDrive',
      description: 'Create chain drive system',
    },

    params: {
      driveTeeth: {
        default: 17,
        min: 9,
        max: 50,
      },
      drivenTeeth: {
        default: 42,
        min: 15,
        max: 120,
      },
      chainPitch: {
        default: 12.7,
        min: 6,
        max: 25.4,
      },
      chainRows: {
        default: 1,
        min: 1,
        max: 3,
      },
    },

    inputs: {
      sprocket1Center: 'Point',
      sprocket2Center: 'Point',
    },

    outputs: {
      system: 'Shape',
      sprockets: 'Shape[]',
      chain: 'Shape',
    },

    async evaluate(context, inputs, params) {
      const result = await context.geometry.execute({
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
        system: result,
        sprockets: result,
        chain: result,
      };
    },
  };
