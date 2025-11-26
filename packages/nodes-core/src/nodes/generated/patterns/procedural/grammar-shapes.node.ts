import type { NodeDefinition } from '@sim4d/types';

interface GrammarShapesParams {
  grammar: string;
  iterations: number;
  seed: string;
}

interface GrammarShapesInputs {
  shapeA: unknown;
  shapeB?: unknown;
}

interface GrammarShapesOutputs {
  result: unknown;
}

export const PatternsProceduralGrammarShapesNode: NodeDefinition<
  GrammarShapesInputs,
  GrammarShapesOutputs,
  GrammarShapesParams
> = {
  id: 'Patterns::GrammarShapes',
  category: 'Patterns',
  label: 'GrammarShapes',
  description: 'Shape grammar generation',
  inputs: {
    shapeA: {
      type: 'Shape',
      label: 'Shape A',
      required: true,
    },
    shapeB: {
      type: 'Shape',
      label: 'Shape B',
      optional: true,
    },
  },
  outputs: {
    result: {
      type: 'Shape[]',
      label: 'Result',
    },
  },
  params: {
    grammar: {
      type: 'string',
      label: 'Grammar',
      default: 'A->AB,B->A',
    },
    iterations: {
      type: 'number',
      label: 'Iterations',
      default: 5,
      min: 1,
      max: 10,
      step: 1,
    },
    seed: {
      type: 'string',
      label: 'Seed',
      default: 'A',
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'grammarShapes',
      params: {
        shapeA: inputs.shapeA,
        shapeB: inputs.shapeB,
        grammar: params.grammar,
        iterations: params.iterations,
        seed: params.seed,
      },
    });

    return {
      result: result,
    };
  },
};
