import type { NodeDefinition } from '@sim4d/types';

interface RackGearParams {
  module: number;
  length: number;
  width: number;
  height: number;
}

interface RackGearInputs {
  path: unknown;
}

interface RackGearOutputs {
  rack: unknown;
  pitchLine: unknown;
}

export const MechanicalEngineeringGearsRackGearNode: NodeDefinition<
  RackGearInputs,
  RackGearOutputs,
  RackGearParams
> = {
  id: 'MechanicalEngineering::RackGear',
  type: 'MechanicalEngineering::RackGear',
  category: 'MechanicalEngineering',
  label: 'RackGear',
  description: 'Create linear rack gear',
  inputs: {
    path: {
      type: 'Wire',
      label: 'Path',
      required: true,
    },
  },
  outputs: {
    rack: {
      type: 'Shape',
      label: 'Rack',
    },
    pitchLine: {
      type: 'Wire',
      label: 'Pitch Line',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 2,
      min: 0.5,
      max: 10,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 100,
      min: 20,
      max: 500,
    },
    width: {
      type: 'number',
      label: 'Width',
      default: 20,
      min: 5,
      max: 50,
    },
    height: {
      type: 'number',
      label: 'Height',
      default: 15,
      min: 5,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'rackGear',
      params: {
        path: inputs.path,
        module: params.module,
        length: params.length,
        width: params.width,
        height: params.height,
      },
    });

    return {
      rack: results.rack,
      pitchLine: results.pitchLine,
    };
  },
};
