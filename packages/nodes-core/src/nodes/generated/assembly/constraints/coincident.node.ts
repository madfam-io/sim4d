import type { NodeDefinition } from '@sim4d/types';

interface CoincidentParams {
  tolerance: number;
}

interface CoincidentInputs {
  entity1: unknown;
  entity2: unknown;
}

interface CoincidentOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsCoincidentNode: NodeDefinition<
  CoincidentInputs,
  CoincidentOutputs,
  CoincidentParams
> = {
  id: 'Assembly::Coincident',
  category: 'Assembly',
  label: 'Coincident',
  description: 'Make two entities coincident',
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
  params: {
    tolerance: {
      type: 'number',
      label: 'Tolerance',
      default: 0.001,
      min: 0,
      max: 1,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'constraintCoincident',
      params: {
        entity1: inputs.entity1,
        entity2: inputs.entity2,
        tolerance: params.tolerance,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
