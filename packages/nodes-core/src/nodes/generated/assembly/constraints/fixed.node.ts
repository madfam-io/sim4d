import type { NodeDefinition } from '@brepflow/types';

type FixedParams = Record<string, never>;

interface FixedInputs {
  entity: unknown;
}

interface FixedOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsFixedNode: NodeDefinition<FixedInputs, FixedOutputs, FixedParams> =
  {
    id: 'Assembly::Fixed',
    category: 'Assembly',
    label: 'Fixed',
    description: 'Fix entity in space',
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
        type: 'constraintFixed',
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
