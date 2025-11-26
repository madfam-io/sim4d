import type { NodeDefinition } from '@sim4d/types';

interface TangentParams {
  inside: boolean;
}

interface TangentInputs {
  entity1: unknown;
  entity2: unknown;
}

interface TangentOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsTangentNode: NodeDefinition<
  TangentInputs,
  TangentOutputs,
  TangentParams
> = {
  id: 'Assembly::Tangent',
  type: 'Assembly::Tangent',
  category: 'Assembly',
  label: 'Tangent',
  description: 'Make two entities tangent',
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
    inside: {
      type: 'boolean',
      label: 'Inside',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'constraintTangent',
      params: {
        entity1: inputs.entity1,
        entity2: inputs.entity2,
        inside: params.inside,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
