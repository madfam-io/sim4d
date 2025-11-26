import type { NodeDefinition } from '@sim4d/types';

interface AngleParams {
  angle: number;
}

interface AngleInputs {
  entity1: unknown;
  entity2: unknown;
}

interface AngleOutputs {
  constrained: unknown;
  constraint: unknown;
}

export const AssemblyConstraintsAngleNode: NodeDefinition<AngleInputs, AngleOutputs, AngleParams> =
  {
    id: 'Assembly::Angle',
    category: 'Assembly',
    label: 'Angle',
    description: 'Set angle between entities',
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
      angle: {
        type: 'number',
        label: 'Angle',
        default: 90,
        min: 0,
        max: 360,
      },
    },
    async evaluate(context, inputs, params) {
      const results = await context.geometry.execute({
        type: 'constraintAngle',
        params: {
          entity1: inputs.entity1,
          entity2: inputs.entity2,
          angle: params.angle,
        },
      });

      return {
        constrained: results.constrained,
        constraint: results.constraint,
      };
    },
  };
