import type { NodeDefinition } from '@sim4d/types';

interface NoiseFieldParams {
  type: string;
  scale: number;
  octaves: number;
  persistence: number;
  seed: number;
}

interface NoiseFieldInputs {
  domain: unknown;
}

interface NoiseFieldOutputs {
  field: unknown;
}

export const FieldGenerateNoiseFieldNode: NodeDefinition<
  NoiseFieldInputs,
  NoiseFieldOutputs,
  NoiseFieldParams
> = {
  id: 'Field::NoiseField',
  category: 'Field',
  label: 'NoiseField',
  description: 'Noise-based field',
  inputs: {
    domain: {
      type: 'Box',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'perlin',
      options: ['perlin', 'simplex', 'worley', 'turbulence'],
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 10,
      min: 0.1,
    },
    octaves: {
      type: 'number',
      label: 'Octaves',
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
    persistence: {
      type: 'number',
      label: 'Persistence',
      default: 0.5,
      min: 0,
      max: 1,
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
      type: 'fieldNoise',
      params: {
        domain: inputs.domain,
        type: params.type,
        scale: params.scale,
        octaves: params.octaves,
        persistence: params.persistence,
        seed: params.seed,
      },
    });

    return {
      field: result,
    };
  },
};
