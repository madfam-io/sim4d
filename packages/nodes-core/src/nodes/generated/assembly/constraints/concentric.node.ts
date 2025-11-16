import type { NodeDefinition } from '@brepflow/types';

type ConcentricParams = Record<string, never>;

interface ConcentricInputs {
  entity1: unknown;
  entity2: unknown;
}

interface ConcentricOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsConcentricNode: NodeDefinition<
  ConcentricInputs,
  ConcentricOutputs,
  ConcentricParams
> = {
  id: 'Assembly::Concentric',
  category: 'Assembly',
  label: 'Concentric',
  description: 'Make two circular entities concentric',
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
      type: 'constraintConcentric',
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
