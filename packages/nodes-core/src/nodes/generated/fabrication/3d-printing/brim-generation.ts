import type { NodeDefinition } from '@brepflow/types';

interface BrimGenerationParams {
  brimWidth: number;
  brimLines: number;
}

interface BrimGenerationInputs {
  model: unknown;
}

interface BrimGenerationOutputs {
  brim: unknown;
}

export const Fabrication3DPrintingBrimGenerationNode: NodeDefinition<
  BrimGenerationInputs,
  BrimGenerationOutputs,
  BrimGenerationParams
> = {
  id: 'Fabrication::BrimGeneration',
  type: 'Fabrication::BrimGeneration',
  category: 'Fabrication',
  label: 'BrimGeneration',
  description: 'Generate brim for adhesion',
  inputs: {
    model: {
      type: 'Shape',
      label: 'Model',
      required: true,
    },
  },
  outputs: {
    brim: {
      type: 'Wire[]',
      label: 'Brim',
    },
  },
  params: {
    brimWidth: {
      type: 'number',
      label: 'Brim Width',
      default: 10,
      min: 1,
      max: 50,
    },
    brimLines: {
      type: 'number',
      label: 'Brim Lines',
      default: 20,
      min: 1,
      max: 100,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'brimGeneration',
      params: {
        model: inputs.model,
        brimWidth: params.brimWidth,
        brimLines: params.brimLines,
      },
    });

    return {
      brim: result,
    };
  },
};
