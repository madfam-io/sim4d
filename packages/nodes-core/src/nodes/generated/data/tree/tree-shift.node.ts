import type { NodeDefinition } from '@brepflow/types';

type TreeShiftParams = Record<string, never>;

interface TreeShiftInputs {
  tree: unknown;
  offset: unknown;
}

interface TreeShiftOutputs {
  shifted: unknown;
}

export const DataTreeTreeShiftNode: NodeDefinition<
  TreeShiftInputs,
  TreeShiftOutputs,
  TreeShiftParams
> = {
  id: 'Data::TreeShift',
  category: 'Data',
  label: 'TreeShift',
  description: 'Shift tree paths',
  inputs: {
    tree: {
      type: 'DataTree',
      label: 'Tree',
      required: true,
    },
    offset: {
      type: 'number',
      label: 'Offset',
      required: true,
    },
  },
  outputs: {
    shifted: {
      type: 'DataTree',
      label: 'Shifted',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'treeShift',
      params: {
        tree: inputs.tree,
        offset: inputs.offset,
      },
    });

    return {
      shifted: result,
    };
  },
};
