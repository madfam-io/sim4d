import type { NodeDefinition } from '@brepflow/types';

interface NoisePatternParams {
  noiseType: string;
  octaves: number;
  frequency: number;
  amplitude: number;
}

interface NoisePatternInputs {
  domain: unknown;
}

interface NoisePatternOutputs {
  noiseField: unknown;
}

export const PatternsProceduralNoisePatternNode: NodeDefinition<
  NoisePatternInputs,
  NoisePatternOutputs,
  NoisePatternParams
> = {
  id: 'Patterns::NoisePattern',
  type: 'Patterns::NoisePattern',
  category: 'Patterns',
  label: 'NoisePattern',
  description: 'Procedural noise patterns',
  inputs: {
    domain: {
      type: 'Box',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    noiseField: {
      type: 'Data',
      label: 'Noise Field',
    },
  },
  params: {
    noiseType: {
      type: 'enum',
      label: 'Noise Type',
      default: 'perlin',
      options: ['perlin', 'simplex', 'worley', 'value', 'white'],
    },
    octaves: {
      type: 'number',
      label: 'Octaves',
      default: 4,
      min: 1,
      max: 8,
      step: 1,
    },
    frequency: {
      type: 'number',
      label: 'Frequency',
      default: 1,
      min: 0.1,
      max: 10,
    },
    amplitude: {
      type: 'number',
      label: 'Amplitude',
      default: 1,
      min: 0.1,
      max: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'noisePattern',
      params: {
        domain: inputs.domain,
        noiseType: params.noiseType,
        octaves: params.octaves,
        frequency: params.frequency,
        amplitude: params.amplitude,
      },
    });

    return {
      noiseField: result,
    };
  },
};
