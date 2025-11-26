import type { NodeDefinition } from '@sim4d/types';

interface DistanceParams {
  distance: number;
  minimum: boolean;
}

interface DistanceInputs {
  entity1: unknown;
  entity2: unknown;
}

interface DistanceOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsDistanceNode: NodeDefinition<
  DistanceInputs,
  DistanceOutputs,
  DistanceParams
> = {
  id: 'Assembly::Distance',
  type: 'Assembly::Distance',
  category: 'Assembly',
  label: 'Distance',
  description: 'Set distance between entities',
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
    distance: {
      type: 'number',
      label: 'Distance',
      default: 10,
      min: 0,
      max: 10000,
    },
    minimum: {
      type: 'boolean',
      label: 'Minimum',
      default: false,
    },
  },
  async evaluate(context, inputs, params) {
    const results = await context.geometry.execute({
      type: 'constraintDistance',
      params: {
        entity1: inputs.entity1,
        entity2: inputs.entity2,
        distance: params.distance,
        minimum: params.minimum,
      },
    });

    return {
      constrained: results.constrained,
      constraint: results.constraint,
    };
  },
};
