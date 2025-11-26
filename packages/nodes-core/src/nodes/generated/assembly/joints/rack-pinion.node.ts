import type { NodeDefinition } from '@sim4d/types';

interface RackPinionParams {
  module: number;
}

interface RackPinionInputs {
  rack: unknown;
  pinion: unknown;
}

interface RackPinionOutputs {
  joint: unknown;
}

export const AssemblyJointsRackPinionNode: NodeDefinition<
  RackPinionInputs,
  RackPinionOutputs,
  RackPinionParams
> = {
  id: 'Assembly::RackPinion',
  category: 'Assembly',
  label: 'RackPinion',
  description: 'Create rack and pinion joint',
  inputs: {
    rack: {
      type: 'Shape',
      label: 'Rack',
      required: true,
    },
    pinion: {
      type: 'Shape',
      label: 'Pinion',
      required: true,
    },
  },
  outputs: {
    joint: {
      type: 'Joint',
      label: 'Joint',
    },
  },
  params: {
    module: {
      type: 'number',
      label: 'Module',
      default: 1,
      min: 0.1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'jointRackPinion',
      params: {
        rack: inputs.rack,
        pinion: inputs.pinion,
        module: params.module,
      },
    });

    return {
      joint: result,
    };
  },
};
