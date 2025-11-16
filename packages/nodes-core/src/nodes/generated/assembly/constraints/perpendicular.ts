import type { NodeDefinition } from '@brepflow/types';

type PerpendicularParams = Record<string, never>;

interface PerpendicularInputs {
  entity1: unknown;
  entity2: unknown;
}

interface PerpendicularOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsPerpendicularNode: NodeDefinition<
  PerpendicularInputs,
  PerpendicularOutputs,
  PerpendicularParams
> = {
  id: 'Assembly::Perpendicular',
  type: 'Assembly::Perpendicular',
  category: 'Assembly',
  label: 'Perpendicular',
  description: 'Make two entities perpendicular',
  inputs: {
    entity1: {
      type: 'Shape',
      label: 'Entity1',
      required: true,
    },
    entity2: {
      type: 'Shape',
      label: 'Entity2',
      required: true,
    },
  },
  outputs: {
    constrained: {
      type: 'Shape[]',
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
      type: 'constraintPerpendicular',
      params: {
        entity1: inputs.entity1,
        entity2: inputs.entity2,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
