import type { NodeDefinition } from '@brepflow/types';

interface SkyLightParams {
  type: string;
  glazingType: string;
}

interface SkyLightInputs {
  opening: unknown;
}

interface SkyLightOutputs {
  skylight: unknown;
  frame: unknown;
}

export const ArchitectureCeilingsSkyLightNode: NodeDefinition<
  SkyLightInputs,
  SkyLightOutputs,
  SkyLightParams
> = {
  id: 'Architecture::SkyLight',
  category: 'Architecture',
  label: 'SkyLight',
  description: 'Skylight opening',
  inputs: {
    opening: {
      type: 'Wire',
      label: 'Opening',
      required: true,
    },
  },
  outputs: {
    skylight: {
      type: 'Shape',
      label: 'Skylight',
    },
    frame: {
      type: 'Shape',
      label: 'Frame',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'pyramid',
      options: ['flat', 'pyramid', 'barrel', 'dome'],
    },
    glazingType: {
      type: 'enum',
      label: 'Glazing Type',
      default: 'double',
      options: ['single', 'double', 'triple', 'aerogel'],
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'skyLight',
      params: {
        opening: inputs.opening,
        type: params.type,
        glazingType: params.glazingType,
      },
    });

    return {
      skylight: results.skylight,
      frame: results.frame,
    };
  },
};
