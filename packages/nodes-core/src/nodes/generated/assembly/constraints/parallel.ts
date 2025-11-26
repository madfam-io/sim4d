import type { NodeDefinition } from '@sim4d/types';

interface ParallelParams {
  offset: number;
  flip: boolean;
}

interface ParallelInputs {
  entity1: unknown;
  entity2: unknown;
}

interface ParallelOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsParallelNode: NodeDefinition<
  ParallelInputs,
  ParallelOutputs,
  ParallelParams
> = {
  id: 'Assembly::Parallel',
  type: 'Assembly::Parallel',
  category: 'Assembly',
  label: 'Parallel',
  description: 'Make two entities parallel',
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
    offset: {
      type: 'number',
      label: 'Offset',
      default: 0,
      min: -10000,
      max: 10000,
    },
    flip: {
      type: 'boolean',
      label: 'Flip',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'constraintParallel',
      params: {
        entity1: inputs.entity1,
        entity2: inputs.entity2,
        offset: params.offset,
        flip: params.flip,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
