import type { NodeDefinition } from '@brepflow/types';

interface VoronoiFractureParams {
  irregularity: number;
  density: number;
}

interface VoronoiFractureInputs {
  surface: unknown;
}

interface VoronoiFractureOutputs {
  fragments: unknown;
}

export const PatternsVoronoiVoronoiFractureNode: NodeDefinition<
  VoronoiFractureInputs,
  VoronoiFractureOutputs,
  VoronoiFractureParams
> = {
  id: 'Patterns::VoronoiFracture',
  type: 'Patterns::VoronoiFracture',
  category: 'Patterns',
  label: 'VoronoiFracture',
  description: 'Fracture pattern generation',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    fragments: {
      type: 'Face[]',
      label: 'Fragments',
    },
  },
  params: {
    irregularity: {
      type: 'number',
      label: 'Irregularity',
      default: 0.5,
      min: 0,
      max: 1,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 10,
      min: 1,
      max: 100,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'voronoiFracture',
      params: {
        surface: inputs.surface,
        irregularity: params.irregularity,
        density: params.density,
      },
    });

    return {
      fragments: result,
    };
  },
};
