import type { NodeDefinition } from '@sim4d/types';

interface PointAttractorParams {
  strength: number;
  radius: number;
  falloff: string;
}

interface PointAttractorInputs {
  points: Array<[number, number, number]>;
}

interface PointAttractorOutputs {
  field: unknown;
}

export const FieldAttractorPointAttractorNode: NodeDefinition<
  PointAttractorInputs,
  PointAttractorOutputs,
  PointAttractorParams
> = {
  id: 'Field::PointAttractor',
  category: 'Field',
  label: 'PointAttractor',
  description: 'Point attractor field',
  inputs: {
    points: {
      type: 'Point[]',
      label: 'Points',
      required: true,
    },
  },
  outputs: {
    field: {
      type: 'ScalarField',
      label: 'Field',
    },
  },
  params: {
    strength: {
      type: 'number',
      label: 'Strength',
      default: 1,
      min: -10,
      max: 10,
    },
    radius: {
      type: 'number',
      label: 'Radius',
      default: 100,
      min: 0.1,
    },
    falloff: {
      type: 'enum',
      label: 'Falloff',
      default: 'quadratic',
      options: ['linear', 'quadratic', 'exponential', 'gaussian'],
    },
  },
  async evaluate(context, inputs, params) {
    const result = await context.geometry.execute({
      type: 'attractorPoint',
      params: {
        points: inputs.points,
        strength: params.strength,
        radius: params.radius,
        falloff: params.falloff,
      },
    });

    return {
      field: result,
    };
  },
};
