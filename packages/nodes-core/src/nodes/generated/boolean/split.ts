import type { NodeDefinition } from '@brepflow/types';

interface SplitParams {
  keepAll: boolean;
}

interface SplitInputs {
  shapes: unknown;
  tools: unknown;
}

interface SplitOutputs {
  fragments: unknown;
}

export const BooleanSplitNode: NodeDefinition<SplitInputs, SplitOutputs, SplitParams> = {
  id: 'Boolean::Split',
  type: 'Boolean::Split',
  category: 'Boolean',
  label: 'Split',
  description: 'Split shapes by each other',
  inputs: {
    shapes: {
      type: 'Shape[]',
      label: 'Shapes',
      required: true,
    },
    tools: {
      type: 'Shape[]',
      label: 'Tools',
      required: true,
    },
  },
  outputs: {
    fragments: {
      type: 'Shape[]',
      label: 'Fragments',
    },
  },
  params: {
    keepAll: {
      type: 'boolean',
      label: 'Keep All',
      default: true,
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanSplit',
      params: {
        shapes: inputs.shapes,
        tools: inputs.tools,
        keepAll: params.keepAll,
      },
    });

    return {
      fragments: result,
    };
  },
};
