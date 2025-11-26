import type { NodeDefinition } from '@sim4d/types';

type HorizontalParams = Record<string, never>;

interface HorizontalInputs {
  entity: unknown;
}

interface HorizontalOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsHorizontalNode: NodeDefinition<
  HorizontalInputs,
  HorizontalOutputs,
  HorizontalParams
> = {
  id: 'Assembly::Horizontal',
  category: 'Assembly',
  label: 'Horizontal',
  description: 'Make entity horizontal',
  inputs: {
    entity: {
      type: 'Shape',
      label: 'Entity',
      required: true,
    },
  },
  outputs: {
    constrained: {
      type: 'Shape',
      label: 'Constrained',
    },
    constraint: {
      type: 'Constraint',
      label: 'Constraint',
    },
  },
  params: {},
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'constraintHorizontal',
      params: {
        entity: inputs.entity,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
