import type { NodeDefinition } from '@sim4d/types';

interface TuringPatternParams {
  model: string;
  iterations: number;
  resolution: number;
}

interface TuringPatternInputs {
  domain: unknown;
}

interface TuringPatternOutputs {
  pattern: unknown;
}

export const PatternsProceduralTuringPatternNode: NodeDefinition<
  TuringPatternInputs,
  TuringPatternOutputs,
  TuringPatternParams
> = {
  id: 'Patterns::TuringPattern',
  type: 'Patterns::TuringPattern',
  category: 'Patterns',
  label: 'TuringPattern',
  description: 'Turing reaction-diffusion',
  inputs: {
    domain: {
      type: 'Face',
      label: 'Domain',
      required: true,
    },
  },
  outputs: {
    pattern: {
      type: 'Mesh',
      label: 'Pattern',
    },
  },
  params: {
    model: {
      type: 'enum',
      label: 'Model',
      default: 'gray-scott',
      options: ['gray-scott', 'gierer-meinhardt', 'brusselator'],
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 1000,
      min: 100,
      max: 10000,
      step: 100,
    },
    resolution: {
      type: 'number',
      label: 'Resolution',
      default: 100,
      min: 50,
      max: 500,
      step: 10,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'turingPattern',
      params: {
        domain: inputs.domain,
        model: params.model,
        iterations: params.iterations,
        resolution: params.resolution,
      },
    });

    return {
      pattern: result,
    };
  },
};
