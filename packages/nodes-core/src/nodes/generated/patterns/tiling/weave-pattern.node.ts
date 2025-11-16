import type { NodeDefinition } from '@brepflow/types';

interface WeavePatternParams {
  weaveType: string;
  warpCount: number;
  weftCount: number;
}

interface WeavePatternInputs {
  boundary: unknown;
}

interface WeavePatternOutputs {
  weave: unknown;
}

export const PatternsTilingWeavePatternNode: NodeDefinition<
  WeavePatternInputs,
  WeavePatternOutputs,
  WeavePatternParams
> = {
  id: 'Patterns::WeavePattern',
  category: 'Patterns',
  label: 'WeavePattern',
  description: 'Weaving patterns',
  inputs: {
    boundary: {
      type: 'Wire',
      label: 'Boundary',
      required: true,
    },
  },
  outputs: {
    weave: {
      type: 'Wire[]',
      label: 'Weave',
    },
  },
  params: {
    weaveType: {
      type: 'enum',
      label: 'Weave Type',
      default: 'plain',
      options: ['plain', 'twill', 'satin', 'basket'],
    },
    warpCount: {
      type: 'number',
      label: 'Warp Count',
      default: 10,
      min: 2,
      max: 50,
      step: 1,
    },
    weftCount: {
      type: 'number',
      label: 'Weft Count',
      default: 10,
      min: 2,
      max: 50,
      step: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'weavePattern',
      params: {
        boundary: inputs.boundary,
        weaveType: params.weaveType,
        warpCount: params.warpCount,
        weftCount: params.weftCount,
      },
    });

    return {
      weave: result,
    };
  },
};
