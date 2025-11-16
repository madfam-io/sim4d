import type { NodeDefinition } from '@brepflow/types';

interface LaserPathParams {
  kerf: number;
  cornerRadius: number;
}

interface LaserPathInputs {
  profiles: unknown;
}

interface LaserPathOutputs {
  cuttingPath: unknown;
}

export const FabricationLaserLaserPathNode: NodeDefinition<
  LaserPathInputs,
  LaserPathOutputs,
  LaserPathParams
> = {
  id: 'Fabrication::LaserPath',
  category: 'Fabrication',
  label: 'LaserPath',
  description: 'Generate laser cutting path',
  inputs: {
    profiles: {
      type: 'Wire[]',
      label: 'Profiles',
      required: true,
    },
  },
  outputs: {
    cuttingPath: {
      type: 'Wire[]',
      label: 'Cutting Path',
    },
  },
  params: {
    kerf: {
      type: 'number',
      label: 'Kerf',
      default: 0.15,
      min: 0,
      max: 1,
    },
    cornerRadius: {
      type: 'number',
      label: 'Corner Radius',
      default: 0,
      min: 0,
      max: 5,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'laserPath',
      params: {
        profiles: inputs.profiles,
        kerf: params.kerf,
        cornerRadius: params.cornerRadius,
      },
    });

    return {
      cuttingPath: result,
    };
  },
};
