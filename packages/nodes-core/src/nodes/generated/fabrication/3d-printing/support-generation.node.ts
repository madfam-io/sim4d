import type { NodeDefinition } from '@brepflow/types';

interface SupportGenerationParams {
  type: string;
  angle: number;
  density: number;
}

interface SupportGenerationInputs {
  model: unknown;
}

interface SupportGenerationOutputs {
  supports: unknown;
  supportedModel: unknown;
}

export const Fabrication3DPrintingSupportGenerationNode: NodeDefinition<
  SupportGenerationInputs,
  SupportGenerationOutputs,
  SupportGenerationParams
> = {
  id: 'Fabrication::SupportGeneration',
  category: 'Fabrication',
  label: 'SupportGeneration',
  description: 'Generate support structures',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    supports: {
      type: 'Shape',
      label: 'Supports',
    },
    supportedModel: {
      type: 'Shape',
      label: 'Supported Model',
    },
  },
  params: {
    type: {
      type: 'enum',
      label: 'Type',
      default: 'tree',
      options: ['tree', 'linear', 'grid', 'organic'],
    },
    angle: {
      type: 'number',
      label: 'Angle',
      default: 45,
      min: 0,
      max: 90,
    },
    density: {
      type: 'number',
      label: 'Density',
      default: 0.2,
      min: 0.1,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'supportGeneration',
      params: {
        model: inputs.model,
        type: params.type,
        angle: params.angle,
        density: params.density,
      },
    });

    return {
      supports: results.supports,
      supportedModel: results.supportedModel,
    };
  },
};
