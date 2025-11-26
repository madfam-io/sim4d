import type { NodeDefinition } from '@sim4d/types';

interface ArabesqueParams {
  complexity: number;
  symmetry: number;
}

interface ArabesqueInputs {
  boundary: unknown;
}

interface ArabesqueOutputs {
  pattern: unknown;
}

export const PatternsIslamicArabesqueNode: NodeDefinition<
  ArabesqueInputs,
  ArabesqueOutputs,
  ArabesqueParams
> = {
  id: 'Patterns::Arabesque',
  type: 'Patterns::Arabesque',
  category: 'Patterns',
  label: 'Arabesque',
  description: 'Arabesque pattern',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
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
    complexity: {
      type: 'number',
      label: 'Complexity',
      default: 3,
      min: 1,
      max: 5,
      step: 1,
    },
    symmetry: {
      type: 'number',
      label: 'Symmetry',
      default: 6,
      min: 3,
      max: 12,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'arabesque',
      params: {
        boundary: inputs.boundary,
        complexity: params.complexity,
        symmetry: params.symmetry,
      },
    });

    return {
      pattern: result,
    };
  },
};
