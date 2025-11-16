import type { NodeDefinition } from '@brepflow/types';

type CommonEdgesParams = Record<string, never>;

interface CommonEdgesInputs {
  shape1: unknown;
  shape2: unknown;
}

interface CommonEdgesOutputs {
  edges: unknown;
}

export const BooleanCommonEdgesNode: NodeDefinition<
  CommonEdgesInputs,
  CommonEdgesOutputs,
  CommonEdgesParams
> = {
  id: 'Boolean::CommonEdges',
  category: 'Boolean',
  label: 'CommonEdges',
  description: 'Extract common edges between shapes',
  inputs: {
    shape1: {
      type: 'Shape',
      label: 'Shape1',
      required: true,
    },
    shape2: {
      type: 'Shape',
      label: 'Shape2',
      required: true,
    },
  },
  outputs: {
    edges: {
      type: 'Edge[]',
      label: 'Edges',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'booleanCommonEdges',
      params: {
        shape1: inputs.shape1,
        shape2: inputs.shape2,
      },
    });

    return {
      edges: result,
    };
  },
};
