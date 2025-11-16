import type { NodeDefinition } from '@brepflow/types';

type VerticalParams = Record<string, never>;

interface VerticalInputs {
  entity: unknown;
}

interface VerticalOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsVerticalNode: NodeDefinition<
  VerticalInputs,
  VerticalOutputs,
  VerticalParams
> = {
  id: 'Assembly::Vertical',
  type: 'Assembly::Vertical',
  category: 'Assembly',
  label: 'Vertical',
  description: 'Make entity vertical',
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
      type: 'constraintVertical',
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
