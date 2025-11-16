import type { NodeDefinition } from '@brepflow/types';

interface ProceduralTextureParams {
  type: string;
  scale: number;
  seed: number;
}

interface ProceduralTextureInputs {
  surface: unknown;
}

interface ProceduralTextureOutputs {
  texture: unknown;
}

export const PatternsProceduralProceduralTextureNode: NodeDefinition<
  ProceduralTextureInputs,
  ProceduralTextureOutputs,
  ProceduralTextureParams
> = {
  id: 'Patterns::ProceduralTexture',
  type: 'Patterns::ProceduralTexture',
  category: 'Patterns',
  label: 'ProceduralTexture',
  description: 'Procedural texture generation',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    texture: {
      type: 'Data',
      label: 'Texture',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'wood',
      options: ['wood', 'marble', 'clouds', 'rust', 'concrete'],
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 10,
      min: 1,
      max: 100,
    },
    seed: {
      type: 'number',
      label: 'Seed',
      default: 0,
      min: 0,
      max: 999999,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'proceduralTexture',
      params: {
        surface: inputs.surface,
        type: params.type,
        scale: params.scale,
        seed: params.seed,
      },
    });

    return {
      texture: result,
    };
  },
};
