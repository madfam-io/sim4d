import type { NodeDefinition } from '@brepflow/types';

interface ReactionDiffusionParams {
  pattern: string;
  scale: number;
  iterations: number;
}

interface ReactionDiffusionInputs {
  surface: unknown;
}

interface ReactionDiffusionOutputs {
  pattern: unknown;
}

export const PatternsGeometricReactionDiffusionNode: NodeDefinition<
  ReactionDiffusionInputs,
  ReactionDiffusionOutputs,
  ReactionDiffusionParams
> = {
  id: 'Patterns::ReactionDiffusion',
  category: 'Patterns',
  label: 'ReactionDiffusion',
  description: 'Reaction-diffusion pattern',
  inputs: {
    surface: {
      type: 'Face',
      label: 'Surface',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Wire[]',
      label: 'Pattern',
    },
  },
  params: {
    pattern: {
      type: 'enum',
      label: 'Pattern',
      default: 'spots',
      options: ['spots', 'stripes', 'labyrinth', 'honeycomb'],
    },
    scale: {
      type: 'number',
      label: 'Scale',
      default: 10,
      min: 1,
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 100,
      min: 10,
      max: 1000,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'reactionDiffusion',
      params: {
        surface: inputs.surface,
        pattern: params.pattern,
        scale: params.scale,
        iterations: params.iterations,
      },
    });

    return {
      pattern: result,
    };
  },
};
