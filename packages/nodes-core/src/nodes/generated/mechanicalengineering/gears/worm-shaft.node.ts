import type { NodeDefinition } from '@sim4d/types';

interface WormShaftParams {
  module: number;
  starts: number;
  length: number;
  leadAngle: number;
}

interface WormShaftInputs {
  axis: unknown;
}

interface WormShaftOutputs {
  worm: unknown;
  helix: unknown;
}

export const MechanicalEngineeringGearsWormShaftNode: NodeDefinition<
  WormShaftInputs,
  WormShaftOutputs,
  WormShaftParams
> = {
  id: 'MechanicalEngineering::WormShaft',
  category: 'MechanicalEngineering',
  label: 'WormShaft',
  description: 'Create worm shaft for worm gear',
  inputs: {
    axis: {
      type: 'Wire',
      label: 'Axis',
      required: true,
    },
  },
  outputs: {
    worm: {
      type: 'Shape',
      label: 'Worm',
    },
    helix: {
      type: 'Wire',
      label: 'Helix',
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
    starts: {
      type: 'number',
      label: 'Starts',
      default: 1,
      min: 1,
      max: 4,
    },
    length: {
      type: 'number',
      label: 'Length',
      default: 50,
      min: 20,
      max: 200,
    },
    leadAngle: {
      type: 'number',
      label: 'Lead Angle',
      default: 5,
      min: 1,
      max: 30,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'wormShaft',
      params: {
        axis: inputs.axis,
        module: params.module,
        starts: params.starts,
        length: params.length,
        leadAngle: params.leadAngle,
      },
    });

    return {
      worm: results.worm,
      helix: results.helix,
    };
  },
};
